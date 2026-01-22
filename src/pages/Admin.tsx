import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Search,
  Store,
  MapPin,
  Loader2,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface SellerProfile {
  user_id: string;
  store_name: string | null;
  store_address: string | null;
  province: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  plan_type: string | null;
  plan_expires_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

const PROVINCES = [
  "Todas",
  "Maputo Cidade",
  "Maputo Província",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Cabo Delgado",
  "Niassa",
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [stores, setStores] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Todas");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    store: SellerProfile | null;
    action: "verify" | "unverify";
  }>({ open: false, store: null, action: "verify" });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchStores();
    }
  }, [isAdmin]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });

      if (error) throw error;

      if (!data) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin role:", error);
      navigate("/");
    } finally {
      setCheckingAdmin(false);
    }
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_type", "vendedor")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as lojas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationChange = async (
    store: SellerProfile,
    verified: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: verified })
        .eq("user_id", store.user_id);

      if (error) throw error;

      setStores((prev) =>
        prev.map((s) =>
          s.user_id === store.user_id ? { ...s, is_verified: verified } : s
        )
      );

      toast({
        title: verified ? "Loja verificada" : "Verificação removida",
        description: `A loja "${store.store_name}" foi ${
          verified ? "verificada" : "desverificada"
        } com sucesso.`,
      });
    } catch (error) {
      console.error("Error updating verification:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de verificação.",
        variant: "destructive",
      });
    }
  };

  const openConfirmDialog = (
    store: SellerProfile,
    action: "verify" | "unverify"
  ) => {
    setConfirmDialog({ open: true, store, action });
  };

  const confirmVerification = () => {
    if (confirmDialog.store) {
      handleVerificationChange(
        confirmDialog.store,
        confirmDialog.action === "verify"
      );
    }
    setConfirmDialog({ open: false, store: null, action: "verify" });
  };

  const getStoreStatus = (store: SellerProfile) => {
    const now = new Date();
    const planExpires = store.plan_expires_at
      ? new Date(store.plan_expires_at)
      : null;
    const trialEnds = store.trial_ends_at
      ? new Date(store.trial_ends_at)
      : null;

    if (planExpires && planExpires > now) {
      return { label: "Plano Ativo", variant: "default" as const };
    }
    if (trialEnds && trialEnds > now) {
      return { label: "Trial", variant: "secondary" as const };
    }
    return { label: "Expirado", variant: "destructive" as const };
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvince =
      selectedProvince === "Todas" || store.province === selectedProvince;

    const matchesVerification =
      verificationFilter === "all" ||
      (verificationFilter === "verified" && store.is_verified) ||
      (verificationFilter === "unverified" && !store.is_verified);

    return matchesSearch && matchesProvince && matchesVerification;
  });

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              Painel de Administração
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie a verificação das lojas de vendedores.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Lojas</p>
                <p className="text-2xl font-bold">{stores.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verificadas</p>
                <p className="text-2xl font-bold">
                  {stores.filter((s) => s.is_verified).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <ShieldX className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Não Verificadas</p>
                <p className="text-2xl font-bold">
                  {stores.filter((s) => !s.is_verified).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Província" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={verificationFilter}
              onValueChange={setVerificationFilter}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="verified">Verificadas</SelectItem>
                <SelectItem value="unverified">Não verificadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma loja encontrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loja</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status do Plano</TableHead>
                  <TableHead>Verificação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((store) => {
                  const status = getStoreStatus(store);
                  return (
                    <TableRow key={store.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                            {store.avatar_url ? (
                              <img
                                src={store.avatar_url}
                                alt={store.store_name || ""}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Store className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {store.store_name || "Sem nome"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {store.phone || store.whatsapp || "Sem contacto"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {store.city || store.province || "Não informado"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {store.is_verified ? (
                          <Badge className="bg-success text-success-foreground gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verificada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Não verificada
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/loja/${store.user_id}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                          {store.is_verified ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openConfirmDialog(store, "unverify")
                              }
                              className="gap-1"
                            >
                              <ShieldX className="h-4 w-4" />
                              Remover
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => openConfirmDialog(store, "verify")}
                              className="gap-1"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              Verificar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      <Footer />

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "verify"
                ? "Verificar loja"
                : "Remover verificação"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "verify"
                ? `Tem certeza que deseja verificar a loja "${confirmDialog.store?.store_name}"? Isso indicará aos clientes que esta loja foi validada.`
                : `Tem certeza que deseja remover a verificação da loja "${confirmDialog.store?.store_name}"? O selo de verificação será removido.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmVerification}>
              {confirmDialog.action === "verify" ? "Verificar" : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;

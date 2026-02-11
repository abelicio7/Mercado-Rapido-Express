import { useState, useEffect, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

interface SubscriptionPayment {
  id: string;
  seller_id: string;
  plan_type: string;
  billing_period: string;
  amount: number;
  payment_method: string;
  payment_reference: string | null;
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

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const MonthlyRevenueChart = ({ payments }: { payments: SubscriptionPayment[] }) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const months: { name: string; receita: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const total = payments
        .filter((p) => {
          const pd = new Date(p.created_at);
          return pd.getMonth() === month && pd.getFullYear() === year;
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);

      months.push({
        name: `${MONTH_NAMES[month]}/${String(year).slice(2)}`,
        receita: total,
      });
    }
    return months;
  }, [payments]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${v.toLocaleString("pt-MZ")}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
          formatter={(value: number) => [`${value.toLocaleString("pt-MZ")} MT`, "Receita"]}
        />
        <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

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

  // Revenue state
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

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
      fetchPayments();
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

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscription_payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments((data as SubscriptionPayment[]) || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setPaymentsLoading(false);
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

  // Revenue calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthPayments = payments.filter((p) => {
    const d = new Date(p.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalRevenueAllTime = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const monthlyRevenue = currentMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const activeSubscriptions = stores.filter((s) => {
    const exp = s.plan_expires_at ? new Date(s.plan_expires_at) : null;
    return exp && exp > now;
  }).length;

  // Estimated monthly recurring revenue based on active subscriptions
  const estimatedMRR = stores.reduce((sum, s) => {
    const exp = s.plan_expires_at ? new Date(s.plan_expires_at) : null;
    if (!exp || exp <= now) return sum;
    if (s.plan_type === "basico") return sum + 497;
    if (s.plan_type === "pro") return sum + 997;
    return sum;
  }, 0);

  const getSellerName = (sellerId: string) => {
    const store = stores.find((s) => s.user_id === sellerId);
    return store?.store_name || "Desconhecido";
  };

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
            Gerencie lojas e acompanhe receitas da plataforma.
          </p>
        </div>

        <Tabs defaultValue="stores" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="stores" className="gap-2">
              <Store className="h-4 w-4" />
              Lojas
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Receitas
            </TabsTrigger>
          </TabsList>

          {/* STORES TAB */}
          <TabsContent value="stores" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="bg-card rounded-xl p-4 shadow-card">
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
          </TabsContent>

          {/* REVENUE TAB */}
          <TabsContent value="revenue" className="space-y-6">
            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Receita do Mês</p>
                    <p className="text-2xl font-bold text-success">
                      {monthlyRevenue.toLocaleString("pt-MZ")} MT
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">MRR Estimado</p>
                    <p className="text-2xl font-bold text-primary">
                      {estimatedMRR.toLocaleString("pt-MZ")} MT
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <p className="text-2xl font-bold">
                      {totalRevenueAllTime.toLocaleString("pt-MZ")} MT
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assinaturas Ativas</p>
                    <p className="text-2xl font-bold">{activeSubscriptions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Evolução Mensal de Receitas</h2>
                <p className="text-sm text-muted-foreground">
                  Receita dos últimos 12 meses
                </p>
              </div>
              <div className="p-4">
                <MonthlyRevenueChart payments={payments} />
              </div>
            </div>

            {/* Payments History */}
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Histórico de Pagamentos</h2>
                <p className="text-sm text-muted-foreground">
                  Todos os pagamentos de assinaturas confirmados
                </p>
              </div>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum pagamento registrado ainda.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Loja</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Referência</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-sm">
                          {new Date(payment.created_at).toLocaleDateString("pt-MZ", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {getSellerName(payment.seller_id)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.plan_type === "pro" ? "default" : "secondary"}>
                            {payment.plan_type === "pro" ? "Pro" : "Básico"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.billing_period === "mensal" ? "Mensal" : "Anual"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase text-xs">
                            {payment.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {payment.payment_reference || "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {Number(payment.amount).toLocaleString("pt-MZ")} MT
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
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

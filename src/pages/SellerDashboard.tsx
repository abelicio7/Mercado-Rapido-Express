import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  TrendingUp,
  Eye,
  MessageCircle,
  Plus,
  Settings,
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  Loader2,
  Store,
  ArrowLeft,
} from "lucide-react";
import logo from "@/assets/logo.jpg";
import ProductsTab from "@/components/seller/ProductsTab";
import MetricsCard from "@/components/seller/MetricsCard";

const SellerDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "settings">("overview");
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalClicks: 0,
    clicksThisMonth: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    
    if (!authLoading && profile && profile.user_type !== "vendedor") {
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Esta página é apenas para vendedores.",
      });
      navigate("/");
    }
  }, [user, profile, authLoading, navigate, toast]);

  useEffect(() => {
    if (user && profile?.user_type === "vendedor") {
      fetchMetrics();
    }
  }, [user, profile]);

  const fetchMetrics = async () => {
    if (!user) return;
    
    setLoadingMetrics(true);
    
    try {
      // Fetch products count
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, is_active")
        .eq("seller_id", user.id);
      
      if (productsError) throw productsError;
      
      const totalProducts = products?.length || 0;
      const activeProducts = products?.filter(p => p.is_active).length || 0;
      
      // Fetch clicks
      const productIds = products?.map(p => p.id) || [];
      let totalClicks = 0;
      let clicksThisMonth = 0;
      
      if (productIds.length > 0) {
        const { data: clicks, error: clicksError } = await supabase
          .from("interest_clicks")
          .select("clicked_at")
          .in("product_id", productIds);
        
        if (clicksError) throw clicksError;
        
        totalClicks = clicks?.length || 0;
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        clicksThisMonth = clicks?.filter(c => 
          new Date(c.clicked_at) >= startOfMonth
        ).length || 0;
      }
      
      setMetrics({
        totalProducts,
        activeProducts,
        totalClicks,
        clicksThisMonth,
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const getPlanStatus = () => {
    if (!profile) return null;
    
    const now = new Date();
    const trialEnds = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
    const planExpires = profile.plan_expires_at ? new Date(profile.plan_expires_at) : null;
    
    if (planExpires && planExpires > now) {
      const daysLeft = Math.ceil((planExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        status: "active",
        label: profile.plan_type === "pro" ? "Plano Pro" : "Plano Básico",
        daysLeft,
        color: "bg-success text-success-foreground",
      };
    }
    
    if (trialEnds && trialEnds > now) {
      const daysLeft = Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        status: "trial",
        label: "Período de Teste",
        daysLeft,
        color: "bg-gold text-gold-foreground",
      };
    }
    
    return {
      status: "expired",
      label: "Plano Expirado",
      daysLeft: 0,
      color: "bg-destructive text-destructive-foreground",
    };
  };

  const planStatus = getPlanStatus();

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Mercado Rápido Express" className="h-8 w-auto rounded-lg" />
            </Link>
            <div className="hidden sm:block h-6 w-px bg-border" />
            <span className="hidden sm:block text-sm font-medium">Painel do Vendedor</span>
          </div>
          
          <div className="flex items-center gap-3">
            {planStatus && (
              <Badge className={planStatus.color}>
                {planStatus.label} • {planStatus.daysLeft} dias
              </Badge>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar ao site</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        {/* Store Info */}
        <div className="bg-card rounded-2xl p-6 shadow-card mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-bold">{profile.store_name}</h1>
                  {profile.is_verified && (
                    <ShieldCheck className="h-5 w-5 text-success" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.store_address}, {profile.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{profile.whatsapp}</span>
                </div>
              </div>
            </div>
            
            {planStatus?.status === "expired" && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Plano Expirado</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Sua loja está oculta. Renove para voltar a aparecer.
                </p>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Renovar Plano
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Visão Geral
          </Button>
          <Button
            variant={activeTab === "products" ? "default" : "outline"}
            onClick={() => setActiveTab("products")}
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Produtos
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricsCard
                title="Total de Produtos"
                value={metrics.totalProducts}
                icon={Package}
                loading={loadingMetrics}
              />
              <MetricsCard
                title="Produtos Activos"
                value={metrics.activeProducts}
                icon={Eye}
                loading={loadingMetrics}
                variant="success"
              />
              <MetricsCard
                title="Cliques Total"
                value={metrics.totalClicks}
                icon={MessageCircle}
                loading={loadingMetrics}
                variant="whatsapp"
              />
              <MetricsCard
                title="Cliques este Mês"
                value={metrics.clicksThisMonth}
                icon={TrendingUp}
                loading={loadingMetrics}
                variant="primary"
              />
            </div>

            {/* Plan Info */}
            {planStatus && (
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Estado do Plano
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={planStatus.color}>{planStatus.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {planStatus.status === "trial" && (
                        <>Você tem {planStatus.daysLeft} dias restantes no período de teste gratuito.</>
                      )}
                      {planStatus.status === "active" && (
                        <>Seu plano expira em {planStatus.daysLeft} dias.</>
                      )}
                      {planStatus.status === "expired" && (
                        <>Sua loja está oculta. Renove para voltar a aparecer nas buscas.</>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {planStatus.status !== "active" && (
                      <Button className="bg-primary hover:bg-primary/90">
                        Escolher Plano
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h3 className="font-display text-lg font-semibold mb-4">Acções Rápidas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setActiveTab("products")}
                >
                  <Plus className="h-6 w-6 text-primary" />
                  <span>Adicionar Produto</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-6 w-6 text-primary" />
                  <span>Editar Loja</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-gold text-gold hover:bg-gold/10"
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>Destacar Produto</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <ProductsTab onMetricsChange={fetchMetrics} />
        )}

        {activeTab === "settings" && (
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold mb-4">Configurações da Loja</h3>
            <p className="text-muted-foreground">Em breve: edição de dados da loja, foto de perfil e mais.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
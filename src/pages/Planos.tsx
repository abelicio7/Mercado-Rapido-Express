import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Check,
  Crown,
  Zap,
  Star,
  ArrowLeft,
  Loader2,
  Shield,
  Smartphone,
  Package,
  TrendingUp,
  Gift,
} from "lucide-react";
import logo from "@/assets/logo.jpg";

type PlanType = "basico" | "pro";
type BillingPeriod = "mensal" | "anual";
type PaymentMethod = "mpesa" | "emola";

const PLANS: Record<PlanType, {
  name: string;
  description: string;
  icon: typeof Package;
  features: string[];
  prices: { mensal: number; anual: number };
  productLimit: number;
  popular?: boolean;
}> = {
  basico: {
    name: "Básico",
    description: "Ideal para começar",
    icon: Package,
    features: [
      "Até 15 produtos",
      "Visibilidade no marketplace",
      "Suporte por WhatsApp",
      "Estatísticas básicas",
    ],
    prices: { mensal: 497, anual: 2997 },
    productLimit: 15,
  },
  pro: {
    name: "Pro",
    description: "Para vendedores profissionais",
    icon: Crown,
    features: [
      "Até 30 produtos",
      "Visibilidade no marketplace",
      "Suporte prioritário",
      "Estatísticas avançadas",
      "Selo de vendedor verificado",
      "Destaque na pesquisa",
    ],
    prices: { mensal: 997, anual: 5999 },
    productLimit: 30,
    popular: true,
  },
};

const Planos = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("mensal");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState(profile?.full_name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleSelectPlan = (plan: PlanType) => {
    if (!user) {
      toast({
        title: "Faça login primeiro",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (profile?.user_type !== "vendedor") {
      toast({
        title: "Apenas para vendedores",
        description: "Esta página é exclusiva para vendedores.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const validatePhone = () => {
    const validMpesa = /^8[45]/.test(phoneNumber);
    const validEmola = /^8[67]/.test(phoneNumber);

    if (paymentMethod === "mpesa" && !validMpesa) {
      return "Use um número M-Pesa válido (84 ou 85)";
    }
    if (paymentMethod === "emola" && !validEmola) {
      return "Use um número e-Mola válido (86 ou 87)";
    }
    return null;
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user) return;

    const phoneError = validatePhone();
    if (phoneError) {
      toast({ title: "Número inválido", description: phoneError, variant: "destructive" });
      return;
    }

    if (!customerName.trim()) {
      toast({ title: "Nome obrigatório", description: "Preencha seu nome completo.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("process-subscription-payment", {
        body: {
          userId: user.id,
          planType: selectedPlan,
          billingPeriod,
          paymentMethod,
          phoneNumber,
          customerName,
          customerEmail,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "🎉 Pagamento confirmado!",
          description: data.message,
        });
        navigate("/planos/obrigado?plan=" + selectedPlan + "&amount=" + data.amount);
      } else {
        toast({
          title: "Pagamento não concluído",
          description: data.error || "Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Erro ao processar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTrialInfo = () => {
    if (!profile?.trial_ends_at) return null;
    const trialEnds = new Date(profile.trial_ends_at);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { trialEnds, daysLeft, isExpired: daysLeft <= 0 };
  };

  const trialInfo = getTrialInfo();

  if (showCheckout && selectedPlan) {
    const plan = PLANS[selectedPlan];
    const price = plan.prices[billingPeriod];

    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
        {/* Header */}
        <header className="bg-background border-b border-border sticky top-0 z-50">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Mercado Rápido Express" className="h-8 w-auto rounded-lg" />
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setShowCheckout(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </header>

        <div className="container max-w-lg py-8">
          {/* Security Badge */}
          <div className="flex items-center justify-between text-sm mb-6">
            <div className="flex items-center gap-2 text-success font-medium">
              <Shield className="h-4 w-4" />
              Pagamento 100% Seguro
            </div>
            <div className="flex items-center gap-1">
              <img
                src="https://flagcdn.com/w40/mz.png"
                alt="MZ"
                className="h-4 w-auto rounded"
              />
              <span className="text-muted-foreground">Moçambique</span>
            </div>
          </div>

          {/* Checkout Card */}
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            {/* Plan Summary */}
            <div className="bg-primary/5 p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <plan.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold">Plano {plan.name}</h2>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{price} MT</div>
                  <div className="text-xs text-muted-foreground">/{billingPeriod === "mensal" ? "mês" : "ano"}</div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seu nome"
                  className="mt-1.5"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-1.5"
                />
              </div>

              {/* Payment Method */}
              <div>
                <Label>Método de pagamento</Label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mpesa")}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-semibold transition-all ${
                      paymentMethod === "mpesa"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <Smartphone className="h-5 w-5" />
                    M-Pesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("emola")}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-semibold transition-all ${
                      paymentMethod === "emola"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <Smartphone className="h-5 w-5" />
                    e-Mola
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">
                  Número de pagamento {paymentMethod === "mpesa" ? "(84/85)" : "(86/87)"}
                </Label>
                <Input
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="8xxxxxxxxx"
                  className="mt-1.5"
                  maxLength={9}
                />
              </div>

              {/* Order Summary */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Plano {plan.name} ({billingPeriod})</span>
                  <span className="font-medium">{price} MT</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{price} MT</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-14 text-lg font-bold bg-success hover:bg-success/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Pagar {price} MT
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ao pagar, você concorda com os nossos termos de serviço.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Mercado Rápido Express" className="h-8 w-auto rounded-lg" />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao site
            </Link>
          </Button>
        </div>
      </header>

      <div className="container py-12">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="bg-primary/10 text-primary mb-4">
            <Gift className="h-3 w-3 mr-1" />
            15 dias grátis para novos vendedores
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Escolha o plano ideal para sua loja
          </h1>
          <p className="text-lg text-muted-foreground">
            Expanda seu negócio e alcance mais clientes em todo Moçambique
          </p>

          {/* Trial Warning */}
          {trialInfo && trialInfo.isExpired && (
            <div className="mt-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 text-destructive font-semibold mb-1">
                <Zap className="h-5 w-5" />
                Seu período gratuito acabou
              </div>
              <p className="text-sm text-muted-foreground">
                Seus produtos não estão sendo exibidos. Escolha um plano abaixo para continuar vendendo.
              </p>
            </div>
          )}

          {trialInfo && !trialInfo.isExpired && trialInfo.daysLeft <= 5 && (
            <div className="mt-6 bg-gold/10 border border-gold/20 rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 text-gold font-semibold mb-1">
                <Zap className="h-5 w-5" />
                {trialInfo.daysLeft} dias restantes no teste gratuito
              </div>
              <p className="text-sm text-muted-foreground">
                Escolha um plano para garantir que sua loja continue visível.
              </p>
            </div>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-card rounded-full p-1 shadow-card inline-flex">
            <button
              onClick={() => setBillingPeriod("mensal")}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                billingPeriod === "mensal"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod("anual")}
              className={`px-6 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 ${
                billingPeriod === "anual"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Anual
              <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                -50%
              </Badge>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(([key, plan]) => (
            <div
              key={key}
              className={`relative bg-card rounded-2xl shadow-card overflow-hidden ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                  <Star className="h-4 w-4 inline mr-1" />
                  Mais Popular
                </div>
              )}

              <div className={`p-8 ${plan.popular ? "pt-14" : ""}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.prices[billingPeriod]}</span>
                    <span className="text-muted-foreground">MT</span>
                    <span className="text-sm text-muted-foreground">
                      /{billingPeriod === "mensal" ? "mês" : "ano"}
                    </span>
                  </div>
                  {billingPeriod === "anual" && (
                    <p className="text-sm text-success mt-1">
                      Economia de {plan.prices.mensal * 12 - plan.prices.anual} MT/ano
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(key)}
                  className={`w-full h-12 font-semibold ${
                    plan.popular ? "bg-primary hover:bg-primary/90" : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Escolher {plan.name}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Highlight Product Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gold/20 to-gold/5 rounded-2xl p-8 border border-gold/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-gold" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display text-xl font-bold mb-2">Destaque seus Produtos</h3>
                <p className="text-muted-foreground mb-4">
                  Aumente a visibilidade dos seus produtos com destaque no topo das listagens. 
                  Seus produtos aparecem com selo especial e maior destaque.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="text-2xl font-bold text-gold">197 MT<span className="text-base font-normal text-muted-foreground">/dia</span></div>
                  <Badge className="bg-gold/20 text-gold border-gold/30">
                    Por produto
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-gold text-gold hover:bg-gold/10"
                onClick={() => navigate("/painel")}
              >
                Destacar no Painel
              </Button>
            </div>
          </div>
        </div>

        {/* FAQ/Info */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <h3 className="font-display text-xl font-semibold mb-4">Perguntas Frequentes</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Como funciona o trial?</strong><br />
              Novos vendedores têm 15 dias grátis com acesso completo. Após esse período, escolha um plano para continuar.
            </p>
            <p>
              <strong className="text-foreground">Formas de pagamento?</strong><br />
              Aceitamos M-Pesa e e-Mola para sua conveniência.
            </p>
            <p>
              <strong className="text-foreground">Posso mudar de plano?</strong><br />
              Sim! Você pode fazer upgrade a qualquer momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planos;

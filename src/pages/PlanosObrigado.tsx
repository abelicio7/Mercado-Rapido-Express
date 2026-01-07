import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Store, Package, TrendingUp } from "lucide-react";
import logo from "@/assets/logo.jpg";

const PlanosObrigado = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "basico";
  const amount = searchParams.get("amount") || "497";

  useEffect(() => {
    // Optional: Track conversion here
    console.log("Subscription confirmed:", { plan, amount });
  }, [plan, amount]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-success/5 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logo} alt="Mercado Rápido Express" className="h-12 w-auto mx-auto rounded-lg" />
          </Link>
        </div>

        {/* Success Card */}
        <div className="bg-card rounded-2xl shadow-card p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>

          <h1 className="font-display text-2xl font-bold mb-2">
            Pagamento Confirmado!
          </h1>
          <p className="text-muted-foreground mb-6">
            Sua assinatura do plano <span className="font-semibold text-foreground capitalize">{plan}</span> foi ativada com sucesso.
          </p>

          {/* Amount Paid */}
          <div className="bg-success/10 rounded-xl p-4 mb-6">
            <div className="text-sm text-muted-foreground mb-1">Valor pago</div>
            <div className="text-3xl font-bold text-success">{amount} MT</div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-left p-3 bg-muted/50 rounded-xl">
              <Store className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm">Sua loja está visível para todos os clientes</span>
            </div>
            <div className="flex items-center gap-3 text-left p-3 bg-muted/50 rounded-xl">
              <Package className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm">Adicione produtos para começar a vender</span>
            </div>
            <div className="flex items-center gap-3 text-left p-3 bg-muted/50 rounded-xl">
              <TrendingUp className="h-5 w-5 text-gold flex-shrink-0" />
              <span className="text-sm">Destaque produtos para mais visibilidade</span>
            </div>
          </div>

          {/* CTA */}
          <Button asChild className="w-full h-12 font-semibold">
            <Link to="/painel">
              Ir para o Painel
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Precisa de ajuda? Entre em contato pelo WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanosObrigado;

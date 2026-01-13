import { Store, TrendingUp, Eye, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const benefits = [
  "Visibilidade para milhares de clientes",
  "Painel com métricas de interesse",
  "Selo de loja verificada",
  "Suporte dedicado via WhatsApp",
];

const ForSellersSection = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate("/auth?tipo=vendedor");
  };

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium">
            <Store className="h-4 w-4" />
            <span>Para Vendedores</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Traga sua loja física para o digital
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mostre seus produtos para milhares de clientes na sua região. Receba contactos directos pelo WhatsApp e aumente suas vendas.
          </p>

          {/* Benefits */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <TrendingUp className="h-6 w-6" />
                <span>+300%</span>
              </div>
              <p className="text-sm text-muted-foreground">Mais visibilidade</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <Eye className="h-6 w-6" />
                <span>10K+</span>
              </div>
              <p className="text-sm text-muted-foreground">Clientes activos</p>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleStartClick}
            size="lg"
            className="px-8"
          >
            Começar Agora
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ForSellersSection;
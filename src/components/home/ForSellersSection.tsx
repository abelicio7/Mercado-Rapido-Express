import { Store, TrendingUp, Eye, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const benefits = [
  "Visibilidade para milhares de clientes",
  "Painel com métricas de interesse",
  "Selo de loja verificada",
  "Suporte dedicado via WhatsApp",
];

const plans = [
  {
    name: "Básico",
    price: "497",
    period: "mês",
    products: 15,
    popular: false,
  },
  {
    name: "Pro",
    price: "997",
    period: "mês",
    products: 30,
    popular: true,
  },
];

const ForSellersSection = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium">
              <Store className="h-4 w-4" />
              <span>Para Vendedores</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Traga sua loja física para o digital
            </h2>
            
            <p className="text-lg text-muted-foreground">
              Mostre seus produtos para milhares de clientes na sua região. Receba contactos directos pelo WhatsApp e aumente suas vendas.
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                  <TrendingUp className="h-6 w-6" />
                  <span>+300%</span>
                </div>
                <p className="text-sm text-muted-foreground">Mais visibilidade</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                  <Eye className="h-6 w-6" />
                  <span>10K+</span>
                </div>
                <p className="text-sm text-muted-foreground">Clientes activos</p>
              </div>
            </div>

            {/* Free Trial */}
            <div className="bg-gold/10 border border-gold/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-gold" />
                <span className="font-semibold">15 dias grátis</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Experimente sem compromisso. Sem cartão de crédito.
              </p>
            </div>
          </div>

          {/* Right Content - Plans */}
          <div className="grid sm:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-card rounded-2xl p-6 shadow-card ${
                  plan.popular ? "ring-2 ring-primary" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="font-display text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground">MT/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Até {plan.products} produtos
                  </p>
                </div>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  Começar Agora
                </Button>
              </div>
            ))}

            {/* Highlight CTA */}
            <div className="sm:col-span-2 bg-gradient-to-br from-gold/20 to-gold/5 rounded-2xl p-6 text-center">
              <Sparkles className="h-8 w-8 text-gold mx-auto mb-3" />
              <h4 className="font-display font-semibold mb-2">Destaque seus produtos</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Coloque seus produtos no topo das buscas por apenas 197 MT/dia
              </p>
              <Button variant="outline" className="border-gold text-gold hover:bg-gold/10">
                Saber Mais
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForSellersSection;
import { Search, Store, MessageCircle, ShoppingBag } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. Pesquise",
    description: "Procure o produto que deseja encontrar na sua cidade ou província.",
  },
  {
    icon: Store,
    title: "2. Encontre a Loja",
    description: "Veja lojas físicas reais com endereço verificado e produtos em stock.",
  },
  {
    icon: MessageCircle,
    title: "3. Fale pelo WhatsApp",
    description: "Clique em 'Tenho Interesse' e fale directamente com a loja.",
  },
  {
    icon: ShoppingBag,
    title: "4. Compre na Loja",
    description: "Vá à loja, veja o produto pessoalmente e compre com segurança.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Como Funciona?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Simples, rápido e sem complicações. Encontre o que precisa sem pagar online.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-card rounded-2xl p-6 shadow-card hover:shadow-soft transition-shadow group"
            >
              {/* Connector Line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-border -translate-x-1/2 z-0" />
              )}

              {/* Icon */}
              <div className="relative w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <step.icon className="h-7 w-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-display text-lg font-semibold mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-2 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
            <span>Sem pagamentos online — 100% seguro</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
import { ShieldCheck, MapPin, Star, AlertTriangle, MessageCircle, CreditCard } from "lucide-react";

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "Lojas Verificadas",
    description: "Todas as lojas passam por verificação. Selo de confiança para lojas com endereço confirmado.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: MapPin,
    title: "Endereço Real",
    description: "Só lojas físicas com endereço real e verificável. Você pode visitar antes de comprar.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Star,
    title: "Avaliações Reais",
    description: "Veja o que outros clientes dizem. Apenas quem comprou pode avaliar.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: CreditCard,
    title: "Sem Pagamento Online",
    description: "Você só paga na loja, presencialmente. Sem risco de burlas online.",
    color: "text-whatsapp",
    bg: "bg-whatsapp/10",
  },
  {
    icon: MessageCircle,
    title: "Fale Primeiro",
    description: "Converse pelo WhatsApp antes de ir à loja. Tire todas as suas dúvidas.",
    color: "text-whatsapp",
    bg: "bg-whatsapp/10",
  },
  {
    icon: AlertTriangle,
    title: "Denuncie Fraudes",
    description: "Sistema de denúncias para proteger a comunidade contra lojas falsas.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
];

const TrustSection = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>Segurança em primeiro lugar</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Compre com Confiança
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Criado para o mercado moçambicano, focado em combater burlas e promover o comércio local seguro.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-soft transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
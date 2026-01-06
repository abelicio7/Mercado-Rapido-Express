import { ArrowRight, Store, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-16 md:py-20 gradient-hero text-primary-foreground relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-white/20" />
        <div className="absolute bottom-10 left-20 w-32 h-32 rounded-full bg-white/15" />
      </div>

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
            Pronto para começar?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90">
            Junte-se a milhares de moçambicanos que já encontram produtos e lojas de confiança todos os dias.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              asChild
              className="bg-white text-primary hover:bg-white/90 gap-2"
            >
              <Link to="/produtos">
                <Search className="h-5 w-5" />
                Encontrar Produtos
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white text-white hover:bg-white/10 gap-2"
            >
              <Link to="/vender">
                <Store className="h-5 w-5" />
                Criar Minha Loja
              </Link>
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/70 pt-4">
            🇲🇿 Feito em Moçambique, para moçambicanos
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
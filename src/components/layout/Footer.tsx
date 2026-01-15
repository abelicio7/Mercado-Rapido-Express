import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img src={logo} alt="Mercado Rápido Express" className="h-12 w-auto rounded-lg" />
            <p className="text-sm text-primary-foreground/70">
              O catálogo digital de lojas físicas de Moçambique. Encontre produtos reais, em lojas reais, perto de si.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <MapPin className="h-4 w-4" />
              <span>Moçambique 🇲🇿</span>
            </div>
          </div>

          {/* Para Clientes */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Para Clientes</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/produtos" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Ver Produtos
              </Link>
              <Link to="/lojas" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Ver Lojas
              </Link>
              <a href="/#categorias" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Explorar Categorias
              </a>
              <a href="/#como-funciona" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Como Funciona
              </a>
            </nav>
          </div>

          {/* Para Vendedores */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Para Vendedores</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/auth?tipo=vendedor" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Criar Minha Loja
              </Link>
              <Link to="/planos" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Planos e Preços
              </Link>
              <Link to="/auth?tipo=vendedor" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Destacar Produtos
              </Link>
              <Link to="/auth?tipo=vendedor" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Selo de Verificação
              </Link>
            </nav>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Contacto</h4>
            <div className="flex flex-col gap-3">
              <a 
                href="https://wa.me/258879931016" 
                className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
              <a 
                href="mailto:suporte@mercadorapidoexpress.com" 
                className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>suporte@mercadorapidoexpress.com</span>
              </a>
              <a 
                href="tel:+258879931016" 
                className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+258 87 993 1016</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            © 2024 Mercado Rápido Express. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <Link to="/termos" className="text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
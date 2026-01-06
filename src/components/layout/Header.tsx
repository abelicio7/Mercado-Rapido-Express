import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, MapPin, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Mercado Rápido Express" className="h-10 w-auto rounded-lg" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/produtos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Produtos
          </Link>
          <Link to="/lojas" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Lojas
          </Link>
          <Link to="/categorias" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Categorias
          </Link>
          <Link to="/como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Como Funciona
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span>Maputo</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            <span>Entrar</span>
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
            <Store className="h-4 w-4" />
            <span>Vender</span>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-3">
            <Link 
              to="/produtos" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="h-5 w-5 text-muted-foreground" />
              <span>Produtos</span>
            </Link>
            <Link 
              to="/lojas" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Store className="h-5 w-5 text-muted-foreground" />
              <span>Lojas</span>
            </Link>
            <Link 
              to="/categorias" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Categorias</span>
            </Link>
            <Link 
              to="/como-funciona" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Como Funciona</span>
            </Link>
            <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <User className="h-4 w-4" />
                <span>Entrar</span>
              </Button>
              <Button className="w-full justify-start gap-2 bg-primary hover:bg-primary/90">
                <Store className="h-4 w-4" />
                <span>Criar Minha Loja</span>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
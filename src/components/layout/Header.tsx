import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, MapPin, User, Store, LogOut, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.jpg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkAdminRole();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });
      if (!error && data) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
  };

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
          <a href="/#categorias" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Categorias
          </a>
          <a href="/#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Como Funciona
          </a>
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span>Maputo</span>
          </Button>
          
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link to="/favoritos">
                  <Heart className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only">Favoritos</span>
                </Link>
              </Button>
              {profile?.user_type === "vendedor" ? (
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <Link to="/painel">
                    <Store className="h-4 w-4" />
                    <span>Minha Loja</span>
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <Link to="/perfil">
                    <User className="h-4 w-4" />
                    <span>{profile?.full_name?.split(" ")[0] || "Perfil"}</span>
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground">
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link to="/auth">
                  <User className="h-4 w-4" />
                  <span>Entrar</span>
                </Link>
              </Button>
              <Button size="sm" asChild className="gap-2 bg-primary hover:bg-primary/90">
                <Link to="/auth">
                  <Store className="h-4 w-4" />
                  <span>Vender</span>
                </Link>
              </Button>
            </>
          )}
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
            <a 
              href="/#categorias" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Categorias</span>
            </a>
            <a 
              href="/#como-funciona" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Como Funciona</span>
            </a>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="h-5 w-5" />
                <span>Painel Admin</span>
              </Link>
            )}
            
            <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <Link 
                    to="/favoritos" 
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5 text-muted-foreground" />
                    <span>Favoritos</span>
                  </Link>
                  {profile?.user_type === "vendedor" ? (
                    <Button variant="outline" asChild className="w-full justify-start gap-2" onClick={() => setIsMenuOpen(false)}>
                      <Link to="/painel">
                        <Store className="h-4 w-4" />
                        <span>Minha Loja</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" asChild className="w-full justify-start gap-2" onClick={() => setIsMenuOpen(false)}>
                      <Link to="/perfil">
                        <User className="h-4 w-4" />
                        <span>Meu Perfil</span>
                      </Link>
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="w-full justify-start gap-2 text-muted-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full justify-start gap-2" onClick={() => setIsMenuOpen(false)}>
                    <Link to="/auth">
                      <User className="h-4 w-4" />
                      <span>Entrar</span>
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start gap-2 bg-primary hover:bg-primary/90" onClick={() => setIsMenuOpen(false)}>
                    <Link to="/auth">
                      <Store className="h-4 w-4" />
                      <span>Criar Minha Loja</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
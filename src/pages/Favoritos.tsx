import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  stock: number;
  is_highlighted: boolean | null;
  seller_id: string;
  profiles: {
    store_name: string | null;
    city: string | null;
    whatsapp: string | null;
    is_verified: boolean | null;
  } | null;
}

const Favoritos = () => {
  const { user } = useAuth();
  const { favorites } = useFavoritesContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && favorites.length > 0) {
      fetchFavoriteProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [user, favorites]);

  const fetchFavoriteProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          images,
          stock,
          is_highlighted,
          seller_id,
          profiles!products_seller_id_fkey (
            store_name,
            city,
            whatsapp,
            is_verified
          )
        `)
        .in("id", favorites)
        .eq("is_active", true);

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching favorite products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="max-w-md mx-auto text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Faça login para ver seus favoritos</h1>
            <p className="text-muted-foreground mb-6">
              Salve os produtos que mais gosta para encontrá-los facilmente.
            </p>
            <Button asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            Meus Favoritos
          </h1>
          <p className="text-muted-foreground mt-1">
            {favorites.length} produto{favorites.length !== 1 ? "s" : ""} salvo{favorites.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-muted/30 rounded-2xl p-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-semibold text-lg mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground mb-6">
              Explore nossos produtos e salve os que mais gostar!
            </p>
            <Button asChild>
              <Link to="/produtos">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Ver produtos
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.images?.[0] || "https://via.placeholder.com/400x400?text=Sem+Imagem"}
                stock={product.stock}
                storeName={product.profiles?.store_name || "Loja"}
                storeLocation={product.profiles?.city || ""}
                storeWhatsApp={product.profiles?.whatsapp || ""}
                isVerified={product.profiles?.is_verified || false}
                isHighlighted={product.is_highlighted || false}
                sellerId={product.seller_id}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favoritos;

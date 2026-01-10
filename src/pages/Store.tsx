import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store as StoreIcon,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  Loader2,
  Package,
  ArrowLeft,
} from "lucide-react";
import StoreReviews from "@/components/store/StoreReviews";

interface StoreProfile {
  user_id: string;
  store_name: string | null;
  store_description: string | null;
  store_address: string | null;
  province: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  plan_expires_at: string | null;
  trial_ends_at: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  stock: number;
  is_highlighted: boolean | null;
  seller_id: string;
}

const StorePage = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sellerId) {
      fetchStoreData();
    }
  }, [sellerId]);

  const fetchStoreData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch store profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", sellerId)
        .eq("user_type", "vendedor")
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        setError("Loja não encontrada");
        setLoading(false);
        return;
      }

      // Check if store has active plan or trial
      const now = new Date();
      const planExpires = profileData.plan_expires_at ? new Date(profileData.plan_expires_at) : null;
      const trialEnds = profileData.trial_ends_at ? new Date(profileData.trial_ends_at) : null;
      
      const isActive = (planExpires && planExpires > now) || (trialEnds && trialEnds > now);
      
      if (!isActive) {
        setError("Esta loja não está disponível no momento");
        setLoading(false);
        return;
      }

      setStore(profileData);

      // Fetch products - RLS already handles visibility
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", sellerId)
        .eq("is_active", true)
        .order("is_highlighted", { ascending: false })
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      setProducts(productsData || []);
    } catch (err) {
      console.error("Error fetching store:", err);
      setError("Erro ao carregar a loja");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (store?.whatsapp) {
      const message = encodeURIComponent(
        `Olá, encontrei sua loja "${store.store_name}" no Mercado Rápido Express e gostaria de saber mais sobre seus produtos.`
      );
      window.open(`https://wa.me/${store.whatsapp}?text=${message}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="max-w-md mx-auto text-center">
            <StoreIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{error || "Loja não encontrada"}</h1>
            <p className="text-muted-foreground mb-6">
              A loja que procura pode não existir ou estar temporariamente indisponível.
            </p>
            <Button asChild>
              <Link to="/produtos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ver todos os produtos
              </Link>
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
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link to="/produtos">
              <ArrowLeft className="h-4 w-4" />
              Voltar aos produtos
            </Link>
          </Button>
        </div>

        {/* Store Header */}
        <div className="bg-card rounded-2xl p-6 shadow-card mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Store Logo */}
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {store.avatar_url ? (
                <img
                  src={store.avatar_url}
                  alt={store.store_name || "Loja"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <StoreIcon className="h-12 w-12 text-primary" />
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="font-display text-2xl font-bold">{store.store_name}</h1>
                {store.is_verified && (
                  <Badge className="bg-success text-success-foreground gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Verificada
                  </Badge>
                )}
              </div>

              {store.store_description && (
                <p className="text-muted-foreground mb-4">{store.store_description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {store.store_address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{store.store_address}, {store.city}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{store.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Button */}
            {store.whatsapp && (
              <div className="flex-shrink-0">
                <Button
                  onClick={handleWhatsAppClick}
                  className="gap-2 bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contactar via WhatsApp
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Produtos</h2>
              <p className="text-sm text-muted-foreground">
                {products.length} produto{products.length !== 1 ? "s" : ""} disponíve{products.length !== 1 ? "is" : "l"}
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="bg-muted/30 rounded-2xl p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhum produto disponível</h3>
              <p className="text-muted-foreground">
                Esta loja ainda não adicionou produtos.
              </p>
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
                  storeName={store.store_name || "Loja"}
                  storeLocation={`${store.city || ""}`}
                  storeWhatsApp={store.whatsapp || ""}
                  isVerified={store.is_verified || false}
                  isHighlighted={product.is_highlighted || false}
                  sellerId={store.user_id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-12 pt-8 border-t">
          <StoreReviews storeId={sellerId!} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StorePage;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  MapPin,
  Store,
  ArrowLeft,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  is_highlighted: boolean;
  created_at: string;
  categories: { name: string; slug: string } | null;
  profiles: {
    user_id: string;
    store_name: string;
    store_description: string | null;
    store_address: string;
    province: string;
    city: string;
    whatsapp: string;
    is_verified: boolean;
    avatar_url: string | null;
  } | null;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (name, slug),
          profiles!products_seller_id_fkey (
            user_id,
            store_name,
            store_description,
            store_address,
            province,
            city,
            whatsapp,
            is_verified,
            avatar_url
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar o produto.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInterestClick = async () => {
    if (!product) return;

    if (!user) {
      toast({
        title: "Faça login primeiro",
        description: "Precisa estar logado para contactar a loja.",
        variant: "destructive",
      });
      return;
    }

    // Track the click
    try {
      await supabase.from("interest_clicks").insert({
        product_id: product.id,
        user_id: user.id,
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }

    // Open WhatsApp
    const message = encodeURIComponent(
      `Olá, vi o produto "${product.name}" no Mercado Rápido Express e gostaria de saber mais.`
    );
    window.open(`https://wa.me/${product.profiles?.whatsapp}?text=${message}`, "_blank");
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Esgotado", variant: "destructive" as const };
    if (stock <= 3) return { label: `Últimos ${stock}`, variant: "secondary" as const };
    return { label: "Em stock", variant: "default" as const };
  };

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Produto não encontrado</h2>
            <p className="text-muted-foreground mb-6">
              Este produto pode ter sido removido ou não existe.
            </p>
            <Button asChild>
              <Link to="/produtos">Ver todos os produtos</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);
  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <Link
            to="/produtos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos produtos
          </Link>
        </div>

        <div className="container pb-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                {product.is_highlighted && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-highlight text-highlight-foreground gap-1">
                      <Sparkles className="h-3 w-3" />
                      Destaque
                    </Badge>
                  </div>
                )}

                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}

                {/* Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {hasMultipleImages && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - Imagem ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Stock */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.categories && (
                  <Badge variant="outline">{product.categories.name}</Badge>
                )}
                <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
              </div>

              {/* Title & Price */}
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  {product.name}
                </h1>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Description */}
              {product.description && (
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Store Card */}
              {product.profiles && (
                <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Store Avatar */}
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.profiles.avatar_url ? (
                        <img
                          src={product.profiles.avatar_url}
                          alt={product.profiles.store_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>

                    {/* Store Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {product.profiles.store_name}
                        </h3>
                        {product.profiles.is_verified && (
                          <ShieldCheck className="h-5 w-5 text-success flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {product.profiles.store_address && `${product.profiles.store_address}, `}
                          {product.profiles.city}, {product.profiles.province}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Button */}
                  <Button
                    onClick={handleInterestClick}
                    size="lg"
                    className="w-full gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white"
                    disabled={product.stock === 0}
                  >
                    <MessageCircle className="h-5 w-5" />
                    {product.stock === 0 ? "Produto Esgotado" : "Tenho Interesse (WhatsApp)"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Contacte a loja directamente pelo WhatsApp para mais informações
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShareButtons from "@/components/products/ShareButtons";
import PromotionBadge from "@/components/products/PromotionBadge";
import { isPromotionActive, formatExpirationDate } from "@/lib/promotionUtils";
import { buildWhatsAppUrl, openExternalUrl } from "@/lib/whatsapp";
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
  category_id: string | null;
  seller_id: string;
  promotional_price: number | null;
  promotion_expires_at: string | null;
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

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  is_highlighted: boolean;
  promotional_price: number | null;
  promotion_expires_at: string | null;
  profiles: {
    store_name: string;
    is_verified: boolean;
  } | null;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
      setCurrentImageIndex(0);
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

      // Fetch related products after main product loads
      if (data) {
        fetchRelatedProducts(data.id, data.category_id, data.seller_id);
      }
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

  const fetchRelatedProducts = async (
    currentProductId: string,
    categoryId: string | null,
    sellerId: string
  ) => {
    try {
      // First try to get products from same category
      let query = supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          stock,
          images,
          is_highlighted,
          promotional_price,
          promotion_expires_at,
          profiles!products_seller_id_fkey (
            store_name,
            is_verified
          )
        `)
        .eq("is_active", true)
        .neq("id", currentProductId)
        .limit(4);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data: categoryProducts, error: categoryError } = await query;

      if (categoryError) throw categoryError;

      // If we have enough from category, use those
      if (categoryProducts && categoryProducts.length >= 4) {
        setRelatedProducts(categoryProducts);
        return;
      }

      // Otherwise, also get products from the same store
      const { data: storeProducts, error: storeError } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          stock,
          images,
          is_highlighted,
          promotional_price,
          promotion_expires_at,
          profiles!products_seller_id_fkey (
            store_name,
            is_verified
          )
        `)
        .eq("is_active", true)
        .eq("seller_id", sellerId)
        .neq("id", currentProductId)
        .limit(4);

      if (storeError) throw storeError;

      // Combine and deduplicate
      const combined = [...(categoryProducts || [])];
      const existingIds = new Set(combined.map((p) => p.id));

      for (const product of storeProducts || []) {
        if (!existingIds.has(product.id) && combined.length < 4) {
          combined.push(product);
          existingIds.add(product.id);
        }
      }

      setRelatedProducts(combined);
    } catch (error) {
      console.error("Error fetching related products:", error);
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

    const url = buildWhatsAppUrl(
      product.profiles?.whatsapp,
      `Olá, vi o produto "${product.name}" no Mercado Rápido Express e gostaria de saber mais.`
    );

    if (!url) {
      toast({
        variant: "destructive",
        title: "WhatsApp indisponível",
        description: "A loja não tem um número de WhatsApp configurado.",
      });
      return;
    }

    // Track the click (don't await; avoids mobile popup blockers)
    void supabase
      .from("interest_clicks")
      .insert({ product_id: product.id, user_id: user.id })
      .then(({ error }) => {
        if (error) console.error("Error tracking click:", error);
      });

    // Open WhatsApp (more reliable on mobile)
    openExternalUrl(url);
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
                
                {/* Promotion Badge */}
                {isPromotionActive(product.promotional_price, product.promotion_expires_at) && (
                  <div className="absolute top-4 right-4 z-10">
                    <PromotionBadge
                      originalPrice={product.price}
                      promotionalPrice={product.promotional_price}
                      promotionExpiresAt={product.promotion_expires_at}
                    />
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
                {isPromotionActive(product.promotional_price, product.promotion_expires_at) ? (
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-3">
                      <p className="text-3xl md:text-4xl font-bold text-destructive">
                        {formatPrice(product.promotional_price!)}
                      </p>
                      <p className="text-xl text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Promoção válida até {formatExpirationDate(product.promotion_expires_at!)}
                    </p>
                  </div>
                ) : (
                  <p className="text-3xl md:text-4xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </p>
                )}
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

              {/* Share Buttons */}
              <div className="pt-4 border-t border-border">
                <ShareButtons
                  productName={product.name}
                  productUrl={`${window.location.origin}/produtos/${product.id}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="py-12 border-t border-border">
            <div className="container">
              <h2 className="font-display text-2xl font-bold mb-6">
                Produtos Relacionados
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((relatedProduct) => {
                  const stockStatus = getStockStatus(relatedProduct.stock);
                  return (
                    <Link
                      key={relatedProduct.id}
                      to={`/produtos/${relatedProduct.id}`}
                      className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="aspect-square overflow-hidden bg-muted relative">
                        {relatedProduct.is_highlighted && (
                          <div className="absolute top-2 left-2 z-10">
                            <Badge className="bg-highlight text-highlight-foreground gap-1 text-xs">
                              <Sparkles className="h-3 w-3" />
                              Destaque
                            </Badge>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 z-10">
                          <Badge variant={stockStatus.variant} className="text-xs">
                            {stockStatus.label}
                          </Badge>
                        </div>
                        {relatedProduct.images && relatedProduct.images.length > 0 ? (
                          <img
                            src={relatedProduct.images[0]}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3 space-y-1">
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                        {isPromotionActive(relatedProduct.promotional_price, relatedProduct.promotion_expires_at) ? (
                          <div className="flex items-baseline gap-2">
                            <p className="text-lg font-bold text-destructive">
                              {formatPrice(relatedProduct.promotional_price!)}
                            </p>
                            <p className="text-sm text-muted-foreground line-through">
                              {formatPrice(relatedProduct.price)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(relatedProduct.price)}
                          </p>
                        )}
                        {relatedProduct.profiles && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="truncate">{relatedProduct.profiles.store_name}</span>
                            {relatedProduct.profiles.is_verified && (
                              <ShieldCheck className="h-3 w-3 text-success flex-shrink-0" />
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;

import { useState, useEffect } from "react";
import { ArrowRight, Loader2, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/products/ProductCard";
import { isPromotionActive } from "@/lib/promotionUtils";

interface PromotionProduct {
  id: string;
  name: string;
  price: number;
  promotionalPrice: number;
  promotionExpiresAt: string;
  image: string;
  stock: number;
  storeName: string;
  storeLocation: string;
  storeWhatsApp: string;
  isVerified: boolean;
  isHighlighted: boolean;
  sellerId?: string;
}

const PromotionsSection = () => {
  const [products, setProducts] = useState<PromotionProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotionProducts();
  }, []);

  const fetchPromotionProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          promotional_price,
          promotion_expires_at,
          images,
          stock,
          is_highlighted,
          seller_id,
          profiles!products_seller_id_fkey (
            store_name,
            city,
            whatsapp,
            is_verified,
            user_id
          )
        `)
        .eq("is_active", true)
        .not("promotional_price", "is", null)
        .gt("promotion_expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Error fetching promotion products:", error);
        setProducts([]);
        return;
      }

      if (data && data.length > 0) {
        const transformedProducts: PromotionProduct[] = data
          .filter((product: any) => 
            isPromotionActive(product.promotional_price, product.promotion_expires_at)
          )
          .map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            promotionalPrice: product.promotional_price,
            promotionExpiresAt: product.promotion_expires_at,
            image: product.images?.[0] || "https://via.placeholder.com/400x400?text=Sem+Imagem",
            stock: product.stock,
            storeName: product.profiles?.store_name || "Loja",
            storeLocation: product.profiles?.city || "",
            storeWhatsApp: product.profiles?.whatsapp || "",
            isVerified: product.profiles?.is_verified || false,
            isHighlighted: product.is_highlighted || false,
            sellerId: product.profiles?.user_id,
          }));

        setProducts(transformedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching promotion products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Don't render the section if there are no promotions
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 bg-destructive/5 border-y border-destructive/10">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-6 w-6 text-destructive" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-destructive">
                Promoções Activas
              </h2>
            </div>
            <p className="text-muted-foreground">
              Aproveite os melhores descontos por tempo limitado
            </p>
          </div>
          <Button 
            variant="outline" 
            asChild 
            className="gap-2 self-start sm:self-auto border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Link to="/produtos?promocao=true">
              Ver todas as promoções
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-destructive" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                promotionalPrice={product.promotionalPrice}
                promotionExpiresAt={product.promotionExpiresAt}
                image={product.image}
                stock={product.stock}
                storeName={product.storeName}
                storeLocation={product.storeLocation}
                storeWhatsApp={product.storeWhatsApp}
                isVerified={product.isVerified}
                isHighlighted={product.isHighlighted}
                sellerId={product.sellerId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PromotionsSection;

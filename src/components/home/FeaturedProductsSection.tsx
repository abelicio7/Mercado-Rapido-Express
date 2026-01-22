import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/products/ProductCard";

// Mock data for featured products (used as fallback)
const mockFeaturedProducts = [
  {
    id: "mock-1",
    name: "iPhone 14 Pro Max 256GB - Como Novo",
    price: 85000,
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop",
    stock: 2,
    storeName: "TechMoz Store",
    storeLocation: "Maputo, Baixa",
    storeWhatsApp: "258840000001",
    isVerified: true,
    isHighlighted: true,
  },
  {
    id: "mock-2",
    name: "Samsung Galaxy A54 5G 128GB",
    price: 32000,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop",
    stock: 8,
    storeName: "Electro Bazar",
    storeLocation: "Maputo, Matola",
    storeWhatsApp: "258840000002",
    isVerified: true,
    isHighlighted: false,
  },
  {
    id: "mock-3",
    name: "Sofá 3 Lugares Estofado Premium",
    price: 45000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    stock: 3,
    storeName: "Casa & Conforto",
    storeLocation: "Beira, Centro",
    storeWhatsApp: "258840000003",
    isVerified: true,
    isHighlighted: true,
  },
  {
    id: "mock-4",
    name: "Televisão LG 55\" Smart TV 4K",
    price: 55000,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
    stock: 5,
    storeName: "TechMoz Store",
    storeLocation: "Maputo, Baixa",
    storeWhatsApp: "258840000001",
    isVerified: true,
    isHighlighted: false,
  },
  {
    id: "mock-5",
    name: "Fato Executivo Masculino Slim Fit",
    price: 12500,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop",
    stock: 12,
    storeName: "Moda Elegante",
    storeLocation: "Nampula, Centro",
    storeWhatsApp: "258840000004",
    isVerified: false,
    isHighlighted: false,
  },
  {
    id: "mock-6",
    name: "Bicicleta Montanha Aro 29",
    price: 28000,
    image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=400&fit=crop",
    stock: 4,
    storeName: "Desporto Total",
    storeLocation: "Maputo, Sommerschield",
    storeWhatsApp: "258840000005",
    isVerified: true,
    isHighlighted: false,
  },
  {
    id: "mock-7",
    name: "Conjunto Cama Casal Box + Colchão",
    price: 38000,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop",
    stock: 6,
    storeName: "Casa & Conforto",
    storeLocation: "Beira, Centro",
    storeWhatsApp: "258840000003",
    isVerified: true,
    isHighlighted: false,
  },
  {
    id: "mock-8",
    name: "Notebook Lenovo IdeaPad 15.6\"",
    price: 65000,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
    stock: 1,
    storeName: "Electro Bazar",
    storeLocation: "Maputo, Matola",
    storeWhatsApp: "258840000002",
    isVerified: true,
    isHighlighted: true,
  },
];

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  storeName: string;
  storeLocation: string;
  storeWhatsApp: string;
  isVerified: boolean;
  isHighlighted: boolean;
  sellerId?: string;
}

const FeaturedProductsSection = () => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasRealHighlights, setHasRealHighlights] = useState(false);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      // Fetch highlighted products first
      const { data: highlightedProducts, error: highlightedError } = await supabase
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
            is_verified,
            user_id
          )
        `)
        .eq("is_highlighted", true)
        .eq("is_active", true)
        .gt("highlight_expires_at", new Date().toISOString())
        .limit(8);

      if (highlightedError) {
        console.error("Error fetching highlighted products:", highlightedError);
      }

      const realHighlights = highlightedProducts || [];

      // If we have real highlighted products, use them
      if (realHighlights.length > 0) {
        setHasRealHighlights(true);
        
        // Transform to our format
        const transformedProducts: FeaturedProduct[] = realHighlights.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "https://via.placeholder.com/400x400?text=Sem+Imagem",
          stock: product.stock,
          storeName: product.profiles?.store_name || "Loja",
          storeLocation: product.profiles?.city || "",
          storeWhatsApp: product.profiles?.whatsapp || "",
          isVerified: product.profiles?.is_verified || false,
          isHighlighted: true,
          sellerId: product.profiles?.user_id,
        }));

        // If we don't have 8, fetch more regular products
        if (transformedProducts.length < 8) {
          const { data: moreProducts } = await supabase
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
                is_verified,
                user_id
              )
            `)
            .eq("is_active", true)
            .not("id", "in", `(${realHighlights.map(p => p.id).join(",")})`)
            .order("created_at", { ascending: false })
            .limit(8 - transformedProducts.length);

          if (moreProducts) {
            const moreTransformed = moreProducts.map((product: any) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.images?.[0] || "https://via.placeholder.com/400x400?text=Sem+Imagem",
              stock: product.stock,
              storeName: product.profiles?.store_name || "Loja",
              storeLocation: product.profiles?.city || "",
              storeWhatsApp: product.profiles?.whatsapp || "",
              isVerified: product.profiles?.is_verified || false,
              isHighlighted: false,
              sellerId: product.profiles?.user_id,
            }));
            transformedProducts.push(...moreTransformed);
          }
        }

        setProducts(transformedProducts);
      } else {
        // No real highlights yet, check if there are any real products
        const { data: anyProducts } = await supabase
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
              is_verified,
              user_id
            )
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(8);

        if (anyProducts && anyProducts.length > 0) {
          // We have real products but no highlights, show real products
          const transformedProducts: FeaturedProduct[] = anyProducts.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
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
          // No real products at all, use mock data
          setProducts(mockFeaturedProducts);
        }
      }
    } catch (error) {
      console.error("Error fetching featured products:", error);
      // Fallback to mock data on error
      setProducts(mockFeaturedProducts);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-2">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Produtos em Destaque
            </h2>
            <p className="text-muted-foreground">
              Os produtos mais procurados em lojas verificadas
            </p>
          </div>
          <Button variant="ghost" asChild className="gap-2 self-start sm:self-auto">
            <Link to="/produtos">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
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

export default FeaturedProductsSection;

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { isPromotionActive } from "@/lib/promotionUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  X,
  Loader2,
  Package,
  SlidersHorizontal,
  Tag,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  is_highlighted: boolean;
  created_at: string;
  promotional_price: number | null;
  promotion_expires_at: string | null;
  categories: { name: string; slug: string } | null;
  profiles: {
    store_name: string;
    store_address: string;
    province: string;
    city: string;
    whatsapp: string;
    is_verified: boolean;
    user_id: string;
    plan_expires_at: string | null;
    trial_ends_at: string | null;
  } | null;
}

const provinces = [
  "Maputo Cidade",
  "Maputo Província",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Niassa",
  "Cabo Delgado",
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categoria") || "");
  const [selectedProvince, setSelectedProvince] = useState(searchParams.get("provincia") || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("cidade") || "");
  const [showPromotionsOnly, setShowPromotionsOnly] = useState(searchParams.get("promocao") === "true");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Only fetch products when categories are loaded (needed for category filter)
    if (categories.length > 0 || !selectedCategory) {
      fetchProducts();
    }
  }, [selectedCategory, selectedProvince, selectedCity, showPromotionsOnly, categories]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          categories (name, slug),
          profiles!products_seller_id_fkey (
            store_name,
            store_address,
            province,
            city,
            whatsapp,
            is_verified,
            user_id,
            plan_expires_at,
            trial_ends_at
          )
        `)
        .eq("is_active", true)
        .order("is_highlighted", { ascending: false })
        .order("created_at", { ascending: false });

      // Apply category filter
      if (selectedCategory) {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by province and city in JS (since it's in the joined table)
      let filteredData = data || [];

      // Filter out products from sellers with expired plan/trial
      const now = new Date();
      filteredData = filteredData.filter(p => {
        if (!p.profiles) return false;
        const profile = p.profiles as any;
        const planExpires = profile.plan_expires_at ? new Date(profile.plan_expires_at) : null;
        const trialEnds = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
        return (planExpires && planExpires > now) || (trialEnds && trialEnds > now);
      });

      if (selectedProvince) {
        filteredData = filteredData.filter(
          p => p.profiles?.province === selectedProvince
        );
      }

      if (selectedCity) {
        filteredData = filteredData.filter(
          p => p.profiles?.city?.toLowerCase().includes(selectedCity.toLowerCase())
        );
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredData = filteredData.filter(
          p => p.name.toLowerCase().includes(query) ||
               p.description?.toLowerCase().includes(query) ||
               p.profiles?.store_name?.toLowerCase().includes(query)
        );
      }

      // Filter by promotions only
      if (showPromotionsOnly) {
        filteredData = filteredData.filter(
          p => isPromotionActive(p.promotional_price, p.promotion_expires_at)
        );
      }

      setProducts(filteredData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams();
    fetchProducts();
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory) params.set("categoria", selectedCategory);
    if (selectedProvince) params.set("provincia", selectedProvince);
    if (selectedCity) params.set("cidade", selectedCity);
    if (showPromotionsOnly) params.set("promocao", "true");
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedProvince("");
    setSelectedCity("");
    setShowPromotionsOnly(false);
    setSearchParams({});
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const hasActiveFilters = selectedCategory || selectedProvince || selectedCity || searchQuery || showPromotionsOnly;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary/5 border-b border-border py-8">
          <div className="container">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Encontre Produtos
            </h1>
            <p className="text-muted-foreground mb-6">
              Descubra produtos em lojas físicas verificadas perto de si
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="O que procura? Ex: telemóvel, roupa, móveis..."
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" size="lg" className="px-6">
                  Buscar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Filters Panel */}
        {showFilters && (
          <section className="border-b border-border bg-card py-4 animate-fade-in">
            <div className="container">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Categoria</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Province Filter */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Província</label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setSelectedCity("");
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Todas as províncias</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Cidade</label>
                  <input
                    type="text"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder="Nome da cidade"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Promotions Filter */}
                <div className="sm:col-span-3 flex items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPromotionsOnly(!showPromotionsOnly)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      showPromotionsOnly
                        ? "bg-destructive text-destructive-foreground border-destructive"
                        : "bg-background border-border hover:border-destructive/50 hover:bg-destructive/5"
                    }`}
                  >
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">Apenas promoções</span>
                  </button>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filtros activos:</span>
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      {categories.find(c => c.slug === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedProvince && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedProvince}
                      <button onClick={() => { setSelectedProvince(""); setSelectedCity(""); }}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCity && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedCity}
                      <button onClick={() => setSelectedCity("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {showPromotionsOnly && (
                    <Badge variant="secondary" className="gap-1 bg-destructive/10 text-destructive border-destructive/20">
                      <Tag className="h-3 w-3" />
                      Promoções
                      <button onClick={() => setShowPromotionsOnly(false)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar tudo
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section className="py-8">
          <div className="container">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {loading ? (
                  "Carregando..."
                ) : (
                  <>
                    {products.length} produto{products.length !== 1 ? "s" : ""} encontrado{products.length !== 1 ? "s" : ""}
                  </>
                )}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros ou buscar por outro termo.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images?.[0] || "https://via.placeholder.com/400x400?text=Sem+Imagem"}
                    stock={product.stock}
                    storeName={product.profiles?.store_name || "Loja"}
                    storeLocation={`${product.profiles?.city || ""}, ${product.profiles?.province || ""}`}
                    storeWhatsApp={product.profiles?.whatsapp || ""}
                    isVerified={product.profiles?.is_verified || false}
                    isHighlighted={product.is_highlighted || false}
                    sellerId={product.profiles?.user_id}
                    promotionalPrice={product.promotional_price}
                    promotionExpiresAt={product.promotion_expires_at}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
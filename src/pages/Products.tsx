import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MapPin,
  Filter,
  X,
  Loader2,
  Package,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
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
  categories: { name: string; slug: string } | null;
  profiles: {
    store_name: string;
    store_address: string;
    province: string;
    city: string;
    whatsapp: string;
    is_verified: boolean;
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
  const { user } = useAuth();
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedProvince, selectedCity]);

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
            is_verified
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
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedProvince("");
    setSelectedCity("");
    setSearchParams({});
  };

  const handleInterestClick = async (product: Product) => {
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

  const hasActiveFilters = selectedCategory || selectedProvince || selectedCity || searchQuery;

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock);

                  return (
                    <div
                      key={product.id}
                      className={`group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 ${
                        product.is_highlighted ? "ring-2 ring-highlight shadow-highlight" : ""
                      }`}
                    >
                      {/* Highlight Badge */}
                      {product.is_highlighted && (
                        <div className="absolute top-3 left-3 z-10">
                          <Badge className="bg-highlight text-highlight-foreground gap-1">
                            <Sparkles className="h-3 w-3" />
                            Destaque
                          </Badge>
                        </div>
                      )}

                      {/* Stock Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <Badge variant={stockStatus.variant} className="text-xs">
                          {stockStatus.label}
                        </Badge>
                      </div>

                      {/* Image */}
                      <div className="aspect-square overflow-hidden bg-muted">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        {/* Product Info */}
                        <div>
                          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-2xl font-bold text-primary mt-1">
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        {/* Store Info */}
                        {product.profiles && (
                          <div className="flex items-start gap-2 pt-2 border-t border-border">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium truncate">
                                  {product.profiles.store_name}
                                </span>
                                {product.profiles.is_verified && (
                                  <ShieldCheck className="h-4 w-4 text-success flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">
                                  {product.profiles.city}, {product.profiles.province}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <Button
                          onClick={() => handleInterestClick(product)}
                          disabled={product.stock === 0}
                          className="w-full gap-2 bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Tenho Interesse
                        </Button>
                      </div>
                    </div>
                  );
                })}
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
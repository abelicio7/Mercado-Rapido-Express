import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Store, CheckCircle, Loader2 } from "lucide-react";

interface StoreProfile {
  user_id: string;
  store_name: string | null;
  store_description: string | null;
  avatar_url: string | null;
  province: string | null;
  city: string | null;
  is_verified: boolean | null;
}

const PROVINCES = [
  "Maputo Cidade",
  "Maputo Província",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Cabo Delgado",
  "Niassa"
];

const Stores = () => {
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, store_name, store_description, avatar_url, province, city, is_verified")
        .eq("user_type", "vendedor")
        .not("store_name", "is", null)
        .or(`plan_expires_at.gt.${now},trial_ends_at.gt.${now}`);

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch = 
      store.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.store_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProvince = !selectedProvince || selectedProvince === "all" || store.province === selectedProvince;
    
    return matchesSearch && matchesProvince;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Descubra as Melhores Lojas
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Explore lojas verificadas em todo Moçambique e encontre produtos de qualidade
              </p>
            </div>

            {/* Filters */}
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar lojas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="w-full md:w-[200px] h-12">
                  <SelectValue placeholder="Província" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Províncias</SelectItem>
                  {PROVINCES.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Stores Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="text-center py-20">
                <Store className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nenhuma loja encontrada
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedProvince 
                    ? "Tente ajustar os filtros de pesquisa"
                    : "Ainda não há lojas registadas"}
                </p>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground mb-6">
                  {filteredStores.length} {filteredStores.length === 1 ? "loja encontrada" : "lojas encontradas"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredStores.map((store) => (
                    <Link key={store.user_id} to={`/loja/${store.user_id}`}>
                      <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {store.avatar_url ? (
                                <img 
                                  src={store.avatar_url} 
                                  alt={store.store_name || "Loja"} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Store className="h-8 w-8 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                  {store.store_name || "Loja sem nome"}
                                </h3>
                                {store.is_verified && (
                                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                )}
                              </div>
                              {(store.city || store.province) && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">
                                    {[store.city, store.province].filter(Boolean).join(", ")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {store.store_description && (
                            <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                              {store.store_description}
                            </p>
                          )}
                          {store.is_verified && (
                            <Badge variant="secondary" className="mt-4">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verificada
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Stores;

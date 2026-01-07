import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ShieldCheck, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    if (selectedProvince) {
      params.set("provincia", selectedProvince);
    }
    
    const queryString = params.toString();
    navigate(`/produtos${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <section className="relative gradient-hero text-primary-foreground overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/20" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-white/15" />
      </div>

      <div className="container relative py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
            <span className="text-lg">🇲🇿</span>
            <span>O marketplace de Moçambique</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
            Encontre produtos reais em lojas físicas perto de si
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Descubra o que existe nas lojas da sua cidade. Sem pagamentos online — fale directamente com a loja pelo WhatsApp.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-soft max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="O que procura? Ex: telemóvel, roupa, móveis..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm md:text-base"
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-2 border-t sm:border-t-0 sm:border-l border-border">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <select 
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="bg-transparent text-foreground focus:outline-none text-sm md:text-base cursor-pointer"
                >
                  <option value="">Toda Moçambique</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Buscar
              </Button>
            </div>
          </form>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-5 w-5" />
              <span>Lojas Verificadas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Store className="h-5 w-5" />
              <span>+500 Lojas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-5 w-5" />
              <span>+10.000 Clientes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 33.3C840 37 960 43 1080 45C1200 47 1320 45 1380 44L1440 43V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;

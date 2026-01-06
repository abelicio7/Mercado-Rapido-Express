import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";

// Mock data for featured products
const featuredProducts = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
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
    id: "5",
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
    id: "6",
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
    id: "7",
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
    id: "8",
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

const FeaturedProductsSection = () => {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
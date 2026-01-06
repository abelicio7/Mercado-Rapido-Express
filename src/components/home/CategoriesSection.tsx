import { Link } from "react-router-dom";
import {
  Smartphone,
  Sofa,
  Shirt,
  Car,
  ShoppingBag,
  Dumbbell,
  Baby,
  Wrench,
  Laptop,
  Home,
} from "lucide-react";

const categories = [
  { name: "Electrónicos", icon: Smartphone, count: 234, slug: "electronicos" },
  { name: "Móveis", icon: Sofa, count: 156, slug: "moveis" },
  { name: "Moda", icon: Shirt, count: 412, slug: "moda" },
  { name: "Veículos", icon: Car, count: 89, slug: "veiculos" },
  { name: "Acessórios", icon: ShoppingBag, count: 198, slug: "acessorios" },
  { name: "Desporto", icon: Dumbbell, count: 76, slug: "desporto" },
  { name: "Bebé e Criança", icon: Baby, count: 134, slug: "bebe-crianca" },
  { name: "Ferramentas", icon: Wrench, count: 67, slug: "ferramentas" },
  { name: "Computadores", icon: Laptop, count: 145, slug: "computadores" },
  { name: "Casa e Jardim", icon: Home, count: 223, slug: "casa-jardim" },
];

const CategoriesSection = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Explore por Categoria
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Encontre exactamente o que procura nas lojas da sua região
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/categorias/${category.slug}`}
              className="group flex flex-col items-center gap-3 p-6 bg-card rounded-2xl shadow-card hover:shadow-soft hover:bg-primary/5 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <category.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {category.count} produtos
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
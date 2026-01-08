import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  Package,
  LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, LucideIcon> = {
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
  Package,
};

const CategoriesSection = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories-with-count'],
    queryFn: async () => {
      const { data: cats, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      const withCounts = await Promise.all(
        (cats || []).map(async (cat) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id)
            .eq('is_active', true);
          return { ...cat, product_count: count || 0 };
        })
      );

      return withCounts;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 bg-background">
        <div className="container">
          <div className="text-center space-y-3 mb-10">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section id="categorias" className="py-16 md:py-20 bg-background scroll-mt-20">
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
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon || ''] || Package;

            return (
              <Link
                key={category.id}
                to={`/produtos?categoria=${category.slug}`}
                className="group flex flex-col items-center gap-3 p-6 bg-card rounded-2xl shadow-card hover:shadow-soft hover:bg-primary/5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-7 w-7 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {category.product_count} {category.product_count === 1 ? 'produto' : 'produtos'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;

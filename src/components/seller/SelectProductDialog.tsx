import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Sparkles, Check, ImageIcon } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  is_highlighted: boolean;
}

interface SelectProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Product) => void;
}

const SelectProductDialog = ({
  open,
  onOpenChange,
  onSelect,
}: SelectProductDialogProps) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      fetchProducts();
    }
  }, [open, user]);

  const fetchProducts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, images, is_highlighted")
        .eq("seller_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const availableProducts = products.filter(p => !p.is_highlighted);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-highlight" />
            Escolher Produto para Destacar
          </DialogTitle>
          <DialogDescription>
            Selecione um dos seus produtos publicados para destacar
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[50vh] space-y-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : availableProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium mb-1">Nenhum produto disponível</p>
              <p className="text-sm text-muted-foreground">
                {products.length === 0 
                  ? "Você ainda não tem produtos publicados."
                  : "Todos os seus produtos já estão destacados."}
              </p>
            </div>
          ) : (
            availableProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  onSelect(product);
                  onOpenChange(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                {/* Image */}
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-primary font-semibold">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* Select indicator */}
                <Sparkles className="h-5 w-5 text-highlight opacity-50" />
              </button>
            ))
          )}
        </div>

        {availableProducts.length > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Produtos já destacados não aparecem nesta lista
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelectProductDialog;

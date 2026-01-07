import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  MessageCircle,
  Loader2,
  Package,
  ImageIcon,
  AlertTriangle,
  Crown,
} from "lucide-react";
import ProductFormDialog from "./ProductFormDialog";
import HighlightDialog from "./HighlightDialog";
import { getProductLimit, getPlanDisplayName } from "@/lib/planLimits";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  is_highlighted: boolean;
  highlight_expires_at: string | null;
  is_active: boolean;
  created_at: string;
  category_id: string | null;
  categories?: { name: string } | null;
  click_count?: number;
}

interface ProductsTabProps {
  onMetricsChange: () => void;
  planType: string | null;
  isInTrial: boolean;
}

const ProductsTab = ({ onMetricsChange, planType, isInTrial }: ProductsTabProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [highlightProduct, setHighlightProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          *,
          categories (name)
        `)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      
      if (productsError) throw productsError;
      
      // Fetch click counts for each product
      const productsWithClicks = await Promise.all(
        (productsData || []).map(async (product) => {
          const { count } = await supabase
            .from("interest_clicks")
            .select("*", { count: "exact", head: true })
            .eq("product_id", product.id);
          
          return {
            ...product,
            click_count: count || 0,
          };
        })
      );
      
      setProducts(productsWithClicks);
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

  const handleToggleActive = async (product: Product) => {
    setTogglingId(product.id);
    
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !product.is_active })
        .eq("id", product.id);
      
      if (error) throw error;
      
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      ));
      
      toast({
        title: product.is_active ? "Produto ocultado" : "Produto activado",
        description: product.is_active 
          ? "O produto não aparece mais nas buscas." 
          : "O produto está visível novamente.",
      });
      
      onMetricsChange();
    } catch (error) {
      console.error("Error toggling product:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar o estado do produto.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Tem certeza que deseja eliminar este produto?")) return;
    
    setDeletingId(productId);
    
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== productId));
      
      toast({
        title: "Produto eliminado",
        description: "O produto foi removido com sucesso.",
      });
      
      onMetricsChange();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível eliminar o produto.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleProductSaved = async (newProductIdForHighlight?: string) => {
    handleDialogClose();
    await fetchProducts();
    onMetricsChange();

    // If a new product ID is provided, open highlight dialog
    if (newProductIdForHighlight) {
      // Find the product we just created
      const { data: newProduct } = await supabase
        .from("products")
        .select("id, name")
        .eq("id", newProductIdForHighlight)
        .maybeSingle();

      if (newProduct) {
        setHighlightProduct({
          id: newProduct.id,
          name: newProduct.name,
        } as Product);
      }
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-12 shadow-card flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const productLimit = getProductLimit(planType, isInTrial);
  const planName = getPlanDisplayName(planType, isInTrial);
  const usagePercent = Math.min((products.length / productLimit) * 100, 100);
  const isLimitReached = products.length >= productLimit;
  const canUpgrade = isInTrial || planType?.toLowerCase() === 'basico';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold">Meus Produtos</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              {products.length}/{productLimit} produtos ({planName})
            </span>
          </div>
          <Progress value={usagePercent} className="h-2 mt-2 max-w-xs" />
        </div>
        {isLimitReached ? (
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Limite atingido</span>
            </div>
            {canUpgrade && (
              <Button asChild className="gap-2">
                <Link to="/planos">
                  <Crown className="h-4 w-4" />
                  Fazer Upgrade
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Produto
          </Button>
        )}
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 shadow-card text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-semibold text-lg mb-2">Nenhum produto cadastrado</h4>
          <p className="text-muted-foreground mb-4">
            Comece a vender adicionando seu primeiro produto.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Primeiro Produto
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-card rounded-xl p-4 shadow-card flex flex-col sm:flex-row gap-4 ${
                !product.is_active ? "opacity-60" : ""
              } ${product.is_highlighted ? "ring-2 ring-gold" : ""}`}
            >
              {/* Image */}
              <div className="w-full sm:w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-semibold truncate">{product.name}</h4>
                  {product.is_highlighted && (
                    <Badge className="bg-gold text-gold-foreground gap-1">
                      <Sparkles className="h-3 w-3" />
                      Destaque
                    </Badge>
                  )}
                  {!product.is_active && (
                    <Badge variant="secondary">Oculto</Badge>
                  )}
                </div>
                <p className="text-xl font-bold text-primary mb-1">
                  {formatPrice(product.price)}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {product.categories && (
                    <span>{product.categories.name}</span>
                  )}
                  <span>Stock: {product.stock}</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {product.click_count} interesse{product.click_count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                {/* Highlight Button */}
                {!product.is_highlighted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHighlightProduct(product)}
                    className="gap-2 text-highlight hover:text-highlight border-highlight/30 hover:border-highlight hover:bg-highlight/5"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="sm:hidden">Destacar</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sm:hidden">Editar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(product)}
                  disabled={togglingId === product.id}
                  className="gap-2"
                >
                  {togglingId === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : product.is_active ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sm:hidden">{product.is_active ? "Ocultar" : "Mostrar"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  {deletingId === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="sm:hidden">Eliminar</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        onSave={handleProductSaved}
        onClose={handleDialogClose}
        currentProductCount={products.length}
        productLimit={productLimit}
        planName={planName}
      />

      {/* Highlight Dialog */}
      {highlightProduct && (
        <HighlightDialog
          open={!!highlightProduct}
          onOpenChange={(open) => !open && setHighlightProduct(null)}
          productId={highlightProduct.id}
          productName={highlightProduct.name}
          onSuccess={() => {
            setHighlightProduct(null);
            fetchProducts();
            onMetricsChange();
          }}
        />
      )}
    </div>
  );
};

export default ProductsTab;
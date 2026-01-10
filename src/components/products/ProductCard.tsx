import { Link } from "react-router-dom";
import { MapPin, MessageCircle, ShieldCheck, Sparkles, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FavoriteButton from "./FavoriteButton";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  storeName: string;
  storeLocation: string;
  storeWhatsApp: string;
  isVerified?: boolean;
  isHighlighted?: boolean;
  sellerId?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  stock,
  storeName,
  storeLocation,
  storeWhatsApp,
  isVerified = false,
  isHighlighted = false,
  sellerId,
}: ProductCardProps) => {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStockStatus = () => {
    if (stock === 0) return { label: "Esgotado", variant: "destructive" as const };
    if (stock <= 3) return { label: `Últimos ${stock}`, variant: "secondary" as const };
    return { label: "Em stock", variant: "default" as const };
  };

  const stockStatus = getStockStatus();

  const handleInterestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = encodeURIComponent(
      `Olá, vi o produto "${name}" no Mercado Rápido Express e gostaria de saber mais.`
    );
    window.open(`https://wa.me/${storeWhatsApp}?text=${message}`, "_blank");
  };

  const handleStoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Check if this is a mock product (no sellerId or starts with 'mock-')
  const isMockProduct = !sellerId || id.startsWith("mock-");

  return (
    <Link
      to={isMockProduct ? "#" : `/produtos/${id}`}
      className={`group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 block ${
        isHighlighted ? "ring-2 ring-highlight shadow-highlight" : ""
      } ${isMockProduct ? "cursor-default" : ""}`}
      onClick={isMockProduct ? (e) => e.preventDefault() : undefined}
    >
      {/* Highlight Badge */}
      {isHighlighted && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-highlight text-highlight-foreground gap-1">
            <Sparkles className="h-3 w-3" />
            Destaque
          </Badge>
        </div>
      )}

      {/* Favorite Button & Stock Badge */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {!isMockProduct && <FavoriteButton productId={id} />}
        <Badge variant={stockStatus.variant} className="text-xs">
          {stockStatus.label}
        </Badge>
      </div>

      {/* Image */}
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Product Info */}
        <div>
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatPrice(price)}
          </p>
        </div>

        {/* Store Info */}
        <div className="flex items-start gap-2 pt-2 border-t border-border">
          <div className="flex-1 min-w-0">
            {sellerId && !isMockProduct ? (
              <Link
                to={`/loja/${sellerId}`}
                onClick={handleStoreClick}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Store className="h-3 w-3 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{storeName}</span>
                {isVerified && (
                  <ShieldCheck className="h-4 w-4 text-success flex-shrink-0" />
                )}
              </Link>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium truncate">{storeName}</span>
                {isVerified && (
                  <ShieldCheck className="h-4 w-4 text-success flex-shrink-0" />
                )}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{storeLocation}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleInterestClick}
          disabled={stock === 0}
          className="w-full gap-2 bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          Tenho Interesse
        </Button>
      </div>
    </Link>
  );
};

export default ProductCard;

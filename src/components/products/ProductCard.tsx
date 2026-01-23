import { Link } from "react-router-dom";
import { MapPin, MessageCircle, ShieldCheck, Sparkles, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FavoriteButton from "./FavoriteButton";
import PromotionBadge from "./PromotionBadge";
import { isPromotionActive } from "@/lib/promotionUtils";

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
  promotionalPrice?: number | null;
  promotionExpiresAt?: string | null;
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
  promotionalPrice,
  promotionExpiresAt,
}: ProductCardProps) => {
  const hasActivePromotion = isPromotionActive(promotionalPrice, promotionExpiresAt);
  const displayPrice = hasActivePromotion ? promotionalPrice! : price;
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
      className={`group relative bg-card rounded-lg sm:rounded-2xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 block ${
        isHighlighted ? "ring-1 sm:ring-2 ring-highlight shadow-highlight" : ""
      } ${isMockProduct ? "cursor-default" : ""}`}
      onClick={isMockProduct ? (e) => e.preventDefault() : undefined}
    >
      {/* Highlight & Promotion Badges */}
      <div className="absolute top-1 sm:top-3 left-1 sm:left-3 z-10 flex flex-col gap-0.5 sm:gap-1">
        {isHighlighted && (
          <Badge className="bg-highlight text-highlight-foreground gap-0.5 sm:gap-1 text-[8px] sm:text-xs px-1 sm:px-2 py-0 sm:py-0.5">
            <Sparkles className="h-2 w-2 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">Destaque</span>
          </Badge>
        )}
        <PromotionBadge
          originalPrice={price}
          promotionalPrice={promotionalPrice}
          promotionExpiresAt={promotionExpiresAt}
          size="sm"
        />
      </div>

      {/* Favorite Button & Stock Badge */}
      <div className="absolute top-1 sm:top-3 right-1 sm:right-3 z-10 flex items-center gap-1 sm:gap-2">
        {!isMockProduct && <FavoriteButton productId={id} size="sm" />}
        <Badge variant={stockStatus.variant} className="text-[8px] sm:text-xs px-1 sm:px-2 py-0 sm:py-0.5">
          <span className="sm:hidden">{stock > 0 ? stock : "0"}</span>
          <span className="hidden sm:inline">{stockStatus.label}</span>
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
      <div className="p-1.5 sm:p-4 space-y-1 sm:space-y-3">
        {/* Product Info */}
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1 sm:line-clamp-2 group-hover:text-primary transition-colors text-[10px] sm:text-base">
            {name}
          </h3>
          <div className="mt-0.5 sm:mt-1">
            {hasActivePromotion ? (
              <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                <p className="text-xs sm:text-2xl font-bold text-destructive">
                  {formatPrice(displayPrice)}
                </p>
                <p className="text-[8px] sm:text-sm text-muted-foreground line-through hidden sm:block">
                  {formatPrice(price)}
                </p>
              </div>
            ) : (
              <p className="text-xs sm:text-2xl font-bold text-primary">
                {formatPrice(price)}
              </p>
            )}
          </div>
        </div>

        {/* Store Info - Hidden on mobile */}
        <div className="hidden sm:flex items-start gap-2 pt-2 border-t border-border">
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
          className="w-full gap-1 sm:gap-2 bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground text-[9px] sm:text-sm h-6 sm:h-10 px-1 sm:px-4"
        >
          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Tenho Interesse</span>
          <span className="sm:hidden">WhatsApp</span>
        </Button>
      </div>
    </Link>
  );
};

export default ProductCard;

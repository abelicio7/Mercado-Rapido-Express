import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: string;
  variant?: "icon" | "full";
  className?: string;
}

const FavoriteButton = ({ productId, variant = "icon", className }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite, loading } = useFavoritesContext();
  const isFav = isFavorite(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(productId);
  };

  if (variant === "full") {
    return (
      <Button
        variant="outline"
        onClick={handleClick}
        disabled={loading}
        className={cn("gap-2", className)}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            isFav && "fill-red-500 text-red-500"
          )}
        />
        {isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all shadow-sm",
        className
      )}
      aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          isFav ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
        )}
      />
    </button>
  );
};

export default FavoriteButton;

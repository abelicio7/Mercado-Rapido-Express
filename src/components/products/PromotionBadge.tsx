import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { calculateDiscount, isPromotionActive } from "@/lib/promotionUtils";

interface PromotionBadgeProps {
  originalPrice: number;
  promotionalPrice: number | null | undefined;
  promotionExpiresAt: string | null | undefined;
  size?: "sm" | "default";
}

const PromotionBadge = ({
  originalPrice,
  promotionalPrice,
  promotionExpiresAt,
  size = "default",
}: PromotionBadgeProps) => {
  if (!isPromotionActive(promotionalPrice, promotionExpiresAt)) {
    return null;
  }

  const discount = calculateDiscount(originalPrice, promotionalPrice!);

  return (
    <Badge
      className={`bg-destructive text-destructive-foreground gap-1 ${
        size === "sm" ? "text-xs" : ""
      }`}
    >
      <Tag className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      -{discount}%
    </Badge>
  );
};

export default PromotionBadge;

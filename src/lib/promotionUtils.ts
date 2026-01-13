/**
 * Checks if a promotion is currently active
 */
export const isPromotionActive = (
  promotionalPrice: number | null | undefined,
  promotionExpiresAt: string | null | undefined
): boolean => {
  if (!promotionalPrice || !promotionExpiresAt) return false;
  return new Date(promotionExpiresAt) > new Date();
};

/**
 * Calculates the discount percentage
 */
export const calculateDiscount = (
  originalPrice: number,
  promotionalPrice: number
): number => {
  if (originalPrice <= 0 || promotionalPrice <= 0) return 0;
  return Math.round(((originalPrice - promotionalPrice) / originalPrice) * 100);
};

/**
 * Formats the expiration date for display
 */
export const formatExpirationDate = (expiresAt: string): string => {
  const date = new Date(expiresAt);
  return date.toLocaleDateString("pt-MZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const PLAN_PRODUCT_LIMITS = {
  trial: 5,
  free: 5,
  basico: 15,
  pro: 30,
} as const;

export type PlanType = keyof typeof PLAN_PRODUCT_LIMITS;

export function getProductLimit(planType: string | null, isInTrial: boolean): number {
  if (isInTrial) {
    return PLAN_PRODUCT_LIMITS.trial;
  }
  
  const plan = planType?.toLowerCase() as PlanType;
  return PLAN_PRODUCT_LIMITS[plan] || PLAN_PRODUCT_LIMITS.free;
}

export function getPlanDisplayName(planType: string | null, isInTrial: boolean): string {
  if (isInTrial) return 'Período de Teste';
  
  switch (planType?.toLowerCase()) {
    case 'basico':
      return 'Básico';
    case 'pro':
      return 'Pro';
    default:
      return 'Gratuito';
  }
}

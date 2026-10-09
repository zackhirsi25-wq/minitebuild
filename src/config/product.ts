// The one place to change the product name and prices.

export const product = {
  name: "Minitebuild",
  currency: "USD",
  plans: {
    monthly: { id: "monthly", label: "Monthly", price: 49, interval: "month", short: "mo" },
    annual: { id: "annual", label: "Annual", price: 529, interval: "year", short: "yr" },
  },
} as const;

export type PlanId = keyof typeof product.plans;
export const PLAN_IDS = Object.keys(product.plans) as PlanId[];

/** What a customer saves per year on the annual plan versus 12 monthly payments. */
export const annualSaving = product.plans.monthly.price * 12 - product.plans.annual.price;

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/** "$49/mo" */
export function planPriceLabel(plan: PlanId): string {
  const p = product.plans[plan];
  return `${formatPrice(p.price)}/${p.short}`;
}

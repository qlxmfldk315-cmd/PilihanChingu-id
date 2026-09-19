import { getKrwToIdrRate } from "./fx";

export interface FeeTier {
  maxWon: number | null;
  percent: number;
  minFeeIDR: number;
}

export const FEE_TIERS: FeeTier[] = [
  { maxWon: 10_000, percent: 0.22, minFeeIDR: 9_000 },
  { maxWon: 30_000, percent: 0.19, minFeeIDR: 15_000 },
  { maxWon: 70_000, percent: 0.15, minFeeIDR: 30_000 },
  { maxWon: null,   percent: 0.11, minFeeIDR: 60_000 },
];

function pickTier(priceWon: number): FeeTier {
  return FEE_TIERS.find((t) => t.maxWon === null || priceWon <= t.maxWon)!;
}

export function calculateItemTotalIDRSync(priceWon: number, qty: number, rate: number) {
  const tier = pickTier(priceWon);
  const itemCostIDR = Math.round(priceWon * rate) * qty;
  const percentFee = priceWon * rate * tier.percent;
  const feeIDR = Math.round(Math.max(percentFee, tier.minFeeIDR)) * qty;
  return { itemCostIDR, feeIDR, totalIDR: itemCostIDR + feeIDR };
}

export async function calculateItemTotalIDR(priceWon: number, qty: number) {
  const rate = await getKrwToIdrRate();
  return calculateItemTotalIDRSync(priceWon, qty, rate);
}

export function calculateFeeDiscount(
  totalItemCount: number,
  subtotalIDR: number,
  totalFeeIDR: number
) {
  let discountPercent = 0;
  if (subtotalIDR > 1_000_000) discountPercent = 0.07;
  if (totalItemCount >= 10) discountPercent = Math.max(discountPercent, 0.05);
  return {
    discountPercent,
    discountAmountIDR: Math.round(totalFeeIDR * discountPercent),
  };
}
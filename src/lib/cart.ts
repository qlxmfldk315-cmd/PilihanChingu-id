import { calculateItemTotalIDR, calculateFeeDiscount } from "./pricing";

export async function computeCartTotals(
  cartItems: { priceWon: number; qty: number }[]
) {
  let subtotalIDR = 0;
  let totalFeeIDR = 0;
  let totalItemCount = 0;

  for (const item of cartItems) {
    const { itemCostIDR, feeIDR } = await calculateItemTotalIDR(item.priceWon, item.qty);
    subtotalIDR += itemCostIDR;
    totalFeeIDR += feeIDR;
    totalItemCount += item.qty;
  }

  const { discountAmountIDR } = calculateFeeDiscount(totalItemCount, subtotalIDR, totalFeeIDR);

  return {
    subtotalIDR,
    totalFeeIDR: totalFeeIDR - discountAmountIDR,
    discountAmountIDR,
    grandTotalIDR: subtotalIDR + totalFeeIDR - discountAmountIDR,
  };
}
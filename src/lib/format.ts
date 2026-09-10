export const KRW_TO_IDR = 13.0;

export function formatIdr(value: number) {
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
}

export function getJastipFeePercent(priceKRW: number) {
  return priceKRW > 20000 ? 0.3 : 0.4;
}

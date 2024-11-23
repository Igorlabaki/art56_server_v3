export function calcExtraHourPrice(basePrice: number) {
  if (basePrice) {
    const valorHoraExtra = basePrice / 7;
    return valorHoraExtra;
  }
  return 0;
}

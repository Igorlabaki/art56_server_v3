export function calcExtraHourPrice(basePrice: number) {
  if (basePrice) {
    const valorHoraExtra = basePrice / 6;
    return Number(valorHoraExtra.toFixed(0));
  }
  return 0;
}

export function calcExtraHoursQty(eventDurantion: number) {
  const horasExtras = eventDurantion >= 6 ? eventDurantion - 6 : 0;
  return horasExtras;
}

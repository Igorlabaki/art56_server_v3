export function calcExtraHoursQty(eventDurantion: number) {
  const horasExtras = eventDurantion >= 7 ? eventDurantion - 7 : 0;
  return horasExtras;
}

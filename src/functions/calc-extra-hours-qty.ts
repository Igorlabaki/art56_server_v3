export function calcExtraHoursQty(eventDurantion: number, standardEventDuration: number) {
  const horasExtras = eventDurantion >= standardEventDuration ? eventDurantion - standardEventDuration : 0;
  return horasExtras;
}

export function calcEventDuration(startDate: Date, endDate: Date) {
  const diferenca = startDate.getTime() - endDate.getTime();
  const numeroHoras = Math.floor(diferenca / (1000 * 60 * 60)); // Converte para horas arredondando para baixo
  return numeroHoras;
}

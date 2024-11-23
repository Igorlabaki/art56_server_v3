export function calcEventDuration(data1: Date, data2: Date) {
  const diferenca = data2.getTime() - data1.getTime();
  const numeroHoras = Math.floor(diferenca / (1000 * 60 * 60)); // Converte para horas arredondando para baixo
  return numeroHoras;
}

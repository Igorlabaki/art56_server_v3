export function calcEventDuration(startDate: Date, endDate: Date) {
  // Se o horário de término for menor que o de início, significa que o evento termina no dia seguinte
  if (endDate.getTime() < startDate.getTime()) {
    // Adiciona um dia ao endDate
    const nextDayEndDate = new Date(endDate);
    nextDayEndDate.setDate(nextDayEndDate.getDate() + 1);
    
    const diferenca = nextDayEndDate.getTime() - startDate.getTime();
    const numeroHoras = Math.floor(diferenca / (1000 * 60 * 60)); // Converte para horas arredondando para baixo
    return numeroHoras;
  }
  
  const diferenca = endDate.getTime() - startDate.getTime();
  const numeroHoras = Math.floor(diferenca / (1000 * 60 * 60)); // Converte para horas arredondando para baixo
  return numeroHoras;
}

// Teste simples para verificar a lógica de cálculo de duração
function calcEventDuration(startDate, endDate) {
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

// Teste 1: Evento no mesmo dia (14:00 - 18:00)
const start1 = new Date('2024-01-15T14:00:00');
const end1 = new Date('2024-01-15T18:00:00');
console.log('Teste 1 - Evento no mesmo dia (14:00 - 18:00):', calcEventDuration(start1, end1), 'horas');

// Teste 2: Evento que termina no dia seguinte (22:00 - 02:00)
const start2 = new Date('2024-01-15T22:00:00');
const end2 = new Date('2024-01-15T02:00:00');
console.log('Teste 2 - Evento que termina no dia seguinte (22:00 - 02:00):', calcEventDuration(start2, end2), 'horas');

// Teste 3: Evento longo que termina no dia seguinte (20:00 - 06:00)
const start3 = new Date('2024-01-15T20:00:00');
const end3 = new Date('2024-01-15T06:00:00');
console.log('Teste 3 - Evento longo que termina no dia seguinte (20:00 - 06:00):', calcEventDuration(start3, end3), 'horas');

// Teste 4: Evento curto no mesmo dia (09:00 - 12:00)
const start4 = new Date('2024-01-15T09:00:00');
const end4 = new Date('2024-01-15T12:00:00');
console.log('Teste 4 - Evento curto no mesmo dia (09:00 - 12:00):', calcEventDuration(start4, end4), 'horas'); 
import moment from 'moment'
import 'moment-timezone';

interface TransformDateParams {
  date: string;
  endHour: string;
  divisor?: string;
  startHour: string;
}

export function transformDate({
  date,
  divisor,
  endHour,
  startHour,
}: TransformDateParams) {
  const [dayInicio, monthInicio, yearInicio] = date.split(divisor || '/');
  const [hourInicio, minutesInicio] = startHour.split(':');
  const [hourFim, minutesFim] = endHour.split(':');

  const startDate = moment.utc(
    `${yearInicio}-${monthInicio}-${dayInicio} ${hourInicio}:${minutesInicio}`,
    'YYYY-MM-DD HH:mm',
  ).toDate();

  let endDate = moment.utc(
    `${yearInicio}-${monthInicio}-${dayInicio} ${hourFim}:${minutesFim}`,
    'YYYY-MM-DD HH:mm',
  ).toDate();

  // Se o horário de término for menor que o de início, significa que o evento termina no dia seguinte
  if (endDate.getTime() < startDate.getTime()) {
    endDate = moment.utc(
      `${yearInicio}-${monthInicio}-${dayInicio} ${hourFim}:${minutesFim}`,
      'YYYY-MM-DD HH:mm',
    ).add(1, 'day').toDate();
  }

  return {
    endDate,
    startDate
  };
}

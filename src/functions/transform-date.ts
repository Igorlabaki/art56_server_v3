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

  const endDate = moment.utc(
    `${yearInicio}-${monthInicio}-${dayInicio} ${hourFim}:${minutesFim}`,
    'YYYY-MM-DD HH:mm',
  ).toDate();

  return {
    endDate,
    startDate
  };
}

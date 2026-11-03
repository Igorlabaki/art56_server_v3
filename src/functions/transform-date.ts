import moment from 'moment'
import 'moment-timezone';
import { parseWallClockDateParts } from './wall-clock-datetime';

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
  const { year, month, day } = parseWallClockDateParts(date, divisor || '/');
  const [hourInicio, minutesInicio] = startHour.split(':');
  const [hourFim, minutesFim] = endHour.split(':');

  const startMoment = moment.utc(
    `${year}-${month}-${day} ${hourInicio}:${minutesInicio}`,
    'YYYY-MM-DD HH:mm',
    true,
  );

  let endMoment = moment.utc(
    `${year}-${month}-${day} ${hourFim}:${minutesFim}`,
    'YYYY-MM-DD HH:mm',
    true,
  );

  if (!startMoment.isValid() || !endMoment.isValid()) {
    throw new Error(`Formato de data inválido: ${date}`);
  }

  // Hora fim menor que a hora inicio: o evento termina no dia civil seguinte.
  // Horas iguais permanecem no mesmo dia.
  if (endMoment.valueOf() < startMoment.valueOf()) {
    endMoment = endMoment.clone().add(1, 'day');
  }

  return {
    endDate: endMoment.toDate(),
    startDate: startMoment.toDate(),
  };
}

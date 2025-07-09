import { calcBasePrice } from "./calc-base-price";
import { transformDate } from "./transform-date";
import { calcExtraHourPrice } from "./calc-extra-hour-price";
import { calcExtraHoursQty } from "./calc-extra-hours-qty";
import { calcEventDuration } from "./calc-event-duration";

interface CalcStandartTotalProps {
  data: {
    type: string;
    date: string;
    guests: number;
    endHour: string;
    startHour: string;
    perPersonPrice: number;
    totalAmountService: number;
  };
  divisor?: string;
}

export function calcStandartTotalAmount({
  data: {
    date,
    type,
    guests,
    endHour,
    startHour,
    perPersonPrice,
    totalAmountService,
  },
  divisor,
}: CalcStandartTotalProps) {

  const { endDate, startDate } = transformDate({
     date,
     endHour,
     startHour,
     divisor
  });

  const eventDurantion = calcEventDuration(startDate, endDate);

  const [day, month, year] = date.split("-");

  const basePrice = calcBasePrice({
    month,
    type,
    guests,
    perPersonPrice,
  });

  const extraHourPrice = calcExtraHourPrice(basePrice);
  const extraHoursQty = calcExtraHoursQty(eventDurantion);
  const totalAmount = basePrice + totalAmountService + extraHourPrice * extraHoursQty;

  return {
    endDate,
    startDate,
    basePrice,
    totalAmount,
    extraHoursQty,
    extraHourPrice,
  };
}

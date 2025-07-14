import { transformDate } from "./transform-date";
import { calcExtraHourPrice } from "./calc-extra-hour-price";
import { calcExtraHoursQty } from "./calc-extra-hours-qty";
import { calcEventDuration } from "./calc-event-duration";

interface CalcCustomTotalAmountProps {
  data: {
    date: string;
    guests: number;
    endHour: string;
    startHour: string;
    perPersonPrice: number;
    totalAmountInput: number;
    totalAmountService: number;
    standardEventDuration: number;
  },
  divisor?: string;
}

export function calcCustomTotalAmount({ data: { date, endHour, startHour, totalAmountInput,totalAmountService, standardEventDuration }, divisor }: CalcCustomTotalAmountProps) {
  const { endDate, startDate } = transformDate({
    date,
    endHour,
    divisor,
    startHour,
  });

  const eventDurantion = calcEventDuration(startDate, endDate);

  const totalAmountInputWithoutTotalAmountService = totalAmountInput - totalAmountService
  const extraHoursQty = calcExtraHoursQty(eventDurantion, standardEventDuration);
  const basePrice = (totalAmountInputWithoutTotalAmountService / eventDurantion) * (eventDurantion - extraHoursQty)
  const extraHourPrice = calcExtraHourPrice(basePrice);

  const totalAmount = basePrice + totalAmountService + (extraHourPrice * extraHoursQty);

  return {
    endDate,
    startDate,
    basePrice,
    totalAmount,
    extraHoursQty,
    extraHourPrice,
  }
}

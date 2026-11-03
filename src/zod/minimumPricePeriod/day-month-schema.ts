import { format, isValid, parse } from "date-fns";
import { z } from "zod";

export const dayMonthSchema = z.string().refine((value) => {
    const parsed = parse(value, "dd/MM", new Date(2000, 0, 1));
    return isValid(parsed) && format(parsed, "dd/MM") === value;
}, "Data invalida");

export const minimumPricePeriodFieldsSchema = z.object({
    title: z.string().trim().min(1, "Titulo obrigatorio"),
    startDay: dayMonthSchema,
    endDay: dayMonthSchema,
    price: z.number().gt(0, "Preco deve ser maior que zero"),
});

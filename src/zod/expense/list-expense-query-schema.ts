import { z } from "zod";

export const listExpenseRequestQuerySchema = z.object({
    venueId:z.string(),
    name: z.string().optional(),
})

export type ListExpenseRequestQuerySchema = z.infer<typeof listExpenseRequestQuerySchema>;


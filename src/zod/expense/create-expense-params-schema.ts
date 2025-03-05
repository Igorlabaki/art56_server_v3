import { z } from 'zod';

export const createExpenseRequestParams = z.object({
    venueId: z.string(),
    name: z
        .string({
            required_error: 'Estem campo e obrigatorio.',
        })
        .nonempty('Estem campo e obrigatorio.'),
    description: z.string().optional(),
    amount: z.number({
        required_error: 'Estem campo e obrigatorio.',
    }),
    paymentDate: z.date({
        required_error: 'Estem campo e obrigatorio.',
    }),
    type: z.enum(["ANNUAL", "MONTHLY","WEEKLY","BIWEEKLY","SPORADIC"]),
    category:  z.enum(["TAX", "ADVERTISING","MAINTENANCE","INVESTMENT"]),
    recurring: z.boolean(),
});

export type CreateExpenseRequestParams = z.infer<typeof createExpenseRequestParams>;
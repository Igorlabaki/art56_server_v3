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
    paymentDate: z.string().optional(),
    type: z.enum(["ANNUAL", "MONTHLY","WEEKLY","BIWEEKLY","SPORADIC"]),
    category:  z.enum(["TAX", "ADVERTISING","MAINTENANCE","INVESTMENT"]),
    recurring: z.boolean(),
}).refine(
    (data) => data.recurring || (!!data.paymentDate && data.paymentDate !== ''),
    {
        message: 'Data do pagamento é obrigatória quando a despesa não for recorrente.',
        path: ['paymentDate'],
    }
);

export type CreateExpenseRequestParams = z.infer<typeof createExpenseRequestParams>;
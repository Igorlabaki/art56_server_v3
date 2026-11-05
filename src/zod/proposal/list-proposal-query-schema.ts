import { z } from "zod";

function blankToUndefined(value: unknown): unknown {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
}

export const listProposalRequestQuerySchema = z.object({
    venueId: z.string().min(1),
    completeClientName: z.preprocess(blankToUndefined, z.string().max(80).optional()),
    email: z.preprocess(blankToUndefined, z.string().optional()),
    month: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).max(12).optional()),
    year: z.preprocess(blankToUndefined, z.coerce.number().int().optional()),
    day: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).max(31).optional()),
    page: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).optional()),
    sortBy: z.enum(["startDate", "totalAmount", "status"]).default("startDate"),
    sortDir: z.enum(["asc", "desc"]).default("asc"),
    approved: z.preprocess(
        blankToUndefined,
        z.enum(["true", "false"]).optional(),
    ).transform((val) => (val === undefined ? undefined : val === "true")),
    minAmount: z.preprocess(
        blankToUndefined,
        z.coerce.number().finite().nonnegative().optional(),
    ),
    summary: z.preprocess(
        blankToUndefined,
        z.enum(["true", "false"]).optional(),
    ).transform((val) => val === "true"),
}).superRefine((value, ctx) => {
    if (value.day !== undefined && value.month === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Dia exige o mes",
            path: ["day"],
        });
    }
    if (value.summary && value.page === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Resumo exige pagina",
            path: ["summary"],
        });
    }
});

export type ListProposalRequestQuerySchema = z.infer<typeof listProposalRequestQuerySchema>;

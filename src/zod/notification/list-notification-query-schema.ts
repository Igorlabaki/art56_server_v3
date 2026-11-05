import { z } from "zod";

function blankToUndefined(value: unknown): unknown {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
}

const notificationTypeSchema = z.enum([
    "VISIT",
    "EVENT",
    "OTHER",
    "BARTER",
    "PROPOSAL",
    "OVERNIGHT",
    "PRODUCTION",
]);

export const listNotificationRequestQuerySchema = z.object({
    venueId: z.string().min(1),
    q: z.preprocess(blankToUndefined, z.string().max(80).optional()),
    type: z.preprocess(blankToUndefined, notificationTypeSchema.optional()),
    isRead: z.preprocess(
        blankToUndefined,
        z.enum(["true", "false"]).optional(),
    ).transform((val) => (val === undefined ? undefined : val === "true")),
    page: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).optional()),
    summary: z.preprocess(
        blankToUndefined,
        z.enum(["true", "false"]).optional(),
    ).transform((val) => val === "true"),
}).superRefine((value, ctx) => {
    if (value.summary && value.page === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Resumo exige pagina",
            path: ["summary"],
        });
    }
});

export type ListNotificationRequestQuerySchema = z.infer<typeof listNotificationRequestQuerySchema>;

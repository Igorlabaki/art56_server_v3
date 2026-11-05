import { z } from "zod";
import { partnerCategorySchema } from "./partner-category";

enum ContactType {
    TEAM_MEMBER = "TEAM_MEMBER",
    SUPPLIER = "SUPPLIER"
}

function blankToUndefined(value: unknown): unknown {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
}

export const listContactRequestQuerySchema = z.object({
    venueId: z.string().min(1),
    name: z.preprocess(blankToUndefined, z.string().optional()),
    type: z.preprocess(blankToUndefined, z.nativeEnum(ContactType).optional()),
    q: z.preprocess(blankToUndefined, z.string().max(80).optional()),
    category: z.preprocess(blankToUndefined, partnerCategorySchema.optional()),
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

export type ListContactRequestQuerySchema = z.infer<typeof listContactRequestQuerySchema>;

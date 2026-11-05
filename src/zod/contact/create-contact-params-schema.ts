import { z } from "zod";
import { applyPartnerCategory, resolvePartnerCategory } from "./partner-category";
import { applyPartnerDescription, resolvePartnerDescription } from "./partner-description";

enum ContactType {
    TEAM_MEMBER = "TEAM_MEMBER",
    SUPPLIER = "SUPPLIER"
}

const createContactObject = z.object({
    name: z.string(),
    role: z.string(),
    venueId: z.string(),
    whatsapp: z.string(),
    instagramUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),
    url: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    type: z.nativeEnum(ContactType).optional(),
    category: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
});

export const createContactSchema = createContactObject.superRefine((value, ctx) => {
    const decision = resolvePartnerCategory("create", value.type, value.category);
    if (!decision.ok) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["category"],
            message: decision.message,
        });
    }
    const text = resolvePartnerDescription("create", value.type, value.description);
    if (!text.ok) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["description"],
            message: text.message,
        });
    }
}).transform((value) => applyPartnerDescription("create", applyPartnerCategory("create", value)));

export type CreateContactRequestParams = z.output<typeof createContactSchema> & {
    logoUrl?: string | null;
};

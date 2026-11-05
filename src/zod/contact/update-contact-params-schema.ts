import { z } from "zod";
import { applyPartnerCategory, resolvePartnerCategory } from "./partner-category";
import { applyPartnerDescription, resolvePartnerDescription } from "./partner-description";

enum ContactType {
    TEAM_MEMBER = "TEAM_MEMBER",
    SUPPLIER = "SUPPLIER"
}

const updateContactObject = z.object({
    contactId: z.string(),
    data: z.object({
        name: z.string().optional(),
        role: z.string().optional(),
        instagramUrl: z.string().optional(),
        facebookUrl: z.string().optional(),
        tiktokUrl: z.string().optional(),
        url: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        type: z.nativeEnum(ContactType).optional(),
        category: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
    }),
});

export const updateContactSchema = updateContactObject.superRefine((value, ctx) => {
    const decision = resolvePartnerCategory("update", value.data.type, value.data.category);
    if (!decision.ok) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["data", "category"],
            message: decision.message,
        });
    }
    const text = resolvePartnerDescription("update", value.data.type, value.data.description);
    if (!text.ok) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["data", "description"],
            message: text.message,
        });
    }
}).transform((value) => ({
    ...value,
    data: applyPartnerDescription("update", applyPartnerCategory("update", value.data)),
}));

type UpdateContactParsed = z.output<typeof updateContactSchema>;

export type UpdateContactRequestParams = Omit<UpdateContactParsed, "data"> & {
    data: UpdateContactParsed["data"] & { logoUrl?: string | null };
};

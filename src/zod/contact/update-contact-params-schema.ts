import { z } from "zod";

enum ContactType {
    TEAM_MEMBER = "TEAM_MEMBER",
    SUPPLIER = "SUPPLIER"
}

export const updateContactSchema = z.object({
    contactId: z.string(),
    data: z.object({
        name: z.string().optional(),
        role: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().email().optional(),
        type: z.nativeEnum(ContactType).optional(),
    }),
});

export type UpdateContactRequestParams = z.infer<typeof updateContactSchema>;
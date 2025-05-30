import { z } from "zod";

enum ContactType {
    TEAM_MEMBER = "TEAM_MEMBER",
    SUPPLIER = "SUPPLIER"
}

export const createContactSchema = z.object({
    name: z.string(),
    role: z.string(),
    venueId: z.string(),
    whatsapp: z.string(),  
    email: z.string().email().optional(),
    type: z.nativeEnum(ContactType).optional(),
});

export type CreateContactRequestParams = z.infer<typeof createContactSchema>;
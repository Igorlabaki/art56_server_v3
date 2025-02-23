import { z } from "zod";

export const createContactSchema = z.object({
    name: z.string(),
    role: z.string(),
    venueId: z.string(),
    whatsapp: z.string(),
});

export type CreateContactRequestParams = z.infer<typeof createContactSchema>;
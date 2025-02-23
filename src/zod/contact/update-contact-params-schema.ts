import { z } from "zod";

export const updateContactSchema = z.object({
    contactId: z.string(),
    data: z.object({
        name: z.string().optional(),
        role: z.string().optional(),
        whatsapp: z.string().optional(),
    }),
});

export type UpdateContactRequestParams = z.infer<typeof updateContactSchema>;
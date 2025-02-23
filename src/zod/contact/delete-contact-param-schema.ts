import { z } from "zod";

export const deleteContactRequestParamSchema = z.object({
    contactId: z.string(),
})

export type DeleteContactRequestParamSchema = z.infer<typeof deleteContactRequestParamSchema>;


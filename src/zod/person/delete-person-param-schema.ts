import { z } from "zod";

export const deletePersonRequestParamSchema = z.object({
    personId: z.string(),
})

export type DeletePersonRequestParamSchema = z.infer<typeof deletePersonRequestParamSchema>;


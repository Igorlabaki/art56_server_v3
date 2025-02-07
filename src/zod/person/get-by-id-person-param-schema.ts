import { z } from "zod";

export const getbyidPersonRequestParamSchema = z.object({
    personId: z.string(),
})

export type GetByIdPersonRequestParamSchema = z.infer<typeof getbyidPersonRequestParamSchema>;


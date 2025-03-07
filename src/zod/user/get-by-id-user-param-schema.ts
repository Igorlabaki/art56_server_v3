import { z } from "zod";

export const getbyidUserRequestParamSchema = z.object({
    userId: z.string(),
})

export type GetByIdUserRequestParamSchema = z.infer<typeof getbyidUserRequestParamSchema>;


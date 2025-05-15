import { z } from "zod";

export const getbyemailUserRequestParamSchema = z.object({
    email: z.string().email(),
})

export type GetByEmailUserRequestParamSchema = z.infer<typeof getbyemailUserRequestParamSchema>;


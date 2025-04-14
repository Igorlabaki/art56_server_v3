import { z } from "zod";

export const deleteUserRequestParamSchema = z.object({
    userId: z.string(),
})

export type DeleteUserRequestParamSchema = z.infer<typeof deleteUserRequestParamSchema>;


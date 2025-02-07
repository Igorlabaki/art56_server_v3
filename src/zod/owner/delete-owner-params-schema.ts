import { z } from "zod";

export const deleteOwnerSchema = z.object({
    ownerId: z.string(),
});

export type DeleteOwnerSchema = z.infer<typeof deleteOwnerSchema>;
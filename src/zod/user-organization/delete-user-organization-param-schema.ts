import { z } from "zod";

export const deleteUserOrganizationRequestParamSchema = z.object({
    userOrganizationId: z.string(),
})

export type DeleteUserOrganizationRequestParamSchema = z.infer<typeof deleteUserOrganizationRequestParamSchema>;


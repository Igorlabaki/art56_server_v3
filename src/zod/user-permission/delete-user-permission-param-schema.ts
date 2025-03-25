import { z } from "zod";

export const deleteUserPermissionRequestParamSchema = z.object({
    userPermissionId: z.string(),
})

export type DeleteUserPermissionRequestParamSchema = z.infer<typeof deleteUserPermissionRequestParamSchema>;


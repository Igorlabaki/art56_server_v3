import { z } from "zod";

export const listUserPermissionByUserRequestQuerySchema = z.object({
    userOrganizationId:z.string(),
})

export type ListUserPermissionByUserRequestQuerySchema = z.infer<typeof listUserPermissionByUserRequestQuerySchema>;


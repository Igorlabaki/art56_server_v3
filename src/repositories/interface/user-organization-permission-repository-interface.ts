import { UserOrganizationPermission } from "@prisma/client";
import { CreateUserOrganizationPermissionRequestParams } from "../../zod/user-organization-permission/create-user-organization-permission-params-schema";
import { UpdateUserOrganizationPermissionRequestParams } from "../../zod/user-organization-permission/update-user-organization-permission-params-schema";
import { ListUserOrganizationPermissionByUserRequestQuerySchema } from "../../zod/user-organization-permission/list-user-organization-permission-by-query-schema";

export interface UserOrganizationPermissionRepositoryInterface {
  delete: (params: string) => Promise<UserOrganizationPermission | null>
  getById: (params: string) => Promise<UserOrganizationPermission | null>
  create: (params: CreateUserOrganizationPermissionRequestParams) => Promise<UserOrganizationPermission | null>
  update: (params: UpdateUserOrganizationPermissionRequestParams) => Promise<UserOrganizationPermission | null>
  list: (query: ListUserOrganizationPermissionByUserRequestQuerySchema) => Promise<UserOrganizationPermission[]  | null>
} 
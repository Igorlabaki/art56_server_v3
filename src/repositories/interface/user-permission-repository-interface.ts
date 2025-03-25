import { UserPermission } from "@prisma/client";
import { CreateUserPermissionRequestParams } from "../../zod/user-permission/create-user-permission-params-schema";
import { UpdateUserPermissionRequestParams } from "../../zod/user-permission/update-user-permission-params-schema";
import { ListUserPermissionByUserRequestQuerySchema } from "../../zod/user-permission/list-user-permission-by-query-schema";


export interface UserPermissionRepositoryInterface {
  delete: (params: string) => Promise<UserPermission | null>
  getById: (params: string) => Promise<UserPermission | null>
  create: (params: CreateUserPermissionRequestParams) => Promise<UserPermission | null>
  update: (params: UpdateUserPermissionRequestParams) => Promise<UserPermission | null>
  list: (query: ListUserPermissionByUserRequestQuerySchema) => Promise<UserPermission[]  | null>
}
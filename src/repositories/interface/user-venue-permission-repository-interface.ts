import { UserVenuePermission } from "@prisma/client";
import { GetUserVenuePermissionSchema } from "../../zod/user-venue-permission/get-user-venue-permission-params-schema";
import { CreateUserVenuePermissionRequestParams } from "../../zod/user-venue-permission/create-user-venue-permission-params-schema";
import { UpdateUserVenuePermissionRequestParams } from "../../zod/user-venue-permission/update-user-venue-permission-params-schema";
import { ListUserVenuePermissionByUserRequestQuerySchema } from "../../zod/user-venue-permission/list-user-venue-permission-by-query-schema";

export interface UserVenuePermissionRepositoryInterface {
  delete: (params: string) => Promise<UserVenuePermission | null>
  getById: (params: string) => Promise<UserVenuePermission | null>
  getUserVenuePermission: (params: GetUserVenuePermissionSchema)   => Promise<UserVenuePermission | null>
  create: (params: CreateUserVenuePermissionRequestParams) => Promise<UserVenuePermission | null>
  update: (params: UpdateUserVenuePermissionRequestParams) => Promise<UserVenuePermission | null>
  list: (query: ListUserVenuePermissionByUserRequestQuerySchema) => Promise<UserVenuePermission[]  | null>
} 
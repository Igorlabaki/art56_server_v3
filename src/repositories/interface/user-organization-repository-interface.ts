import { Prisma, UserOrganization } from "@prisma/client";
import { CreateUserOrganizationRequestParams } from "../../zod/user-organization/create-user-organization-params-schema";
import { ListUserOrganizationRequestQuerySchema } from "../../zod/user-organization/list-user-organization-query-schema";
import { ListUserOrganizationByOrganizationRequestQuerySchema } from "../../zod/user-organization/list-user-organization-by-organization-query-schema";
import { UpdateUserOrganizationRequestParams } from "../../zod/user-organization/update-user-organization-params-schema";

export type UserOrganizationWithRelations = Prisma.UserOrganizationGetPayload<{
  include: {
    user: true;
    userPermissions: {
      include: {
        userOrganization: {
          select: {
            organizationId: true;
          };
        };
        venue: true;
      };
    };
  };
}>;

export interface UserOrganizationRepositoryInterface {
  delete: (params: string) => Promise<UserOrganization | null>
  getById: (params: string) => Promise<UserOrganizationWithRelations | null>
  create: (params: CreateUserOrganizationRequestParams) => Promise<UserOrganization | null>
  update: (params: UpdateUserOrganizationRequestParams) => Promise<UserOrganization | null>
  list: (query: ListUserOrganizationRequestQuerySchema) => Promise<UserOrganization[]  | null>
  verifyByUserIdAndOrganizationId: (params: {userId: string, organizationId: string}) => Promise<UserOrganization | null>
  listByOrganization: (query: ListUserOrganizationByOrganizationRequestQuerySchema) => Promise<UserOrganization[]  | null>
}
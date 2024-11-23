import { UserOrganization } from "@prisma/client";
import { CreateUserOrganizationRequestParams } from "../../zod/user-organization/create-user-organization-params-schema";

export interface UserOrganizationRepositoryInterface {
  delete: (params: string) => Promise<UserOrganization | null>
  getById: (params: string) => Promise<UserOrganization | null>
  create: (params: CreateUserOrganizationRequestParams) => Promise<UserOrganization | null>
}
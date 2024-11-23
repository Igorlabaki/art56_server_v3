import { Organization, User } from "@prisma/client";
import { CreateOrganizationRequestParams } from "../../zod/organization/create-organization-params-schema";

export interface UpdateOrganizationRequestParams {
  organizationId: string,
  data:{
    name?: string
  }
}
export interface CreateOrganizationParams {
  name: string;
}

export interface OrganizationRepositoryInterface {
  delete: (params: string) => Promise<Organization | null>
  getById: (params: string) => Promise<Organization | null>
  update: (params: UpdateOrganizationRequestParams) => Promise<Organization | null>
  create: (params: CreateOrganizationRequestParams) => Promise<Organization | null>
}
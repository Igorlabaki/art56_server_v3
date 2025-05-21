import { Organization, User } from "@prisma/client";
import { CreateOrganizationRequestParams } from "../../zod/organization/create-organization-params-schema";
import { ListOrganizationQuerySchema } from "../../zod/organization/list-organization-params-schema";
import { GetByIdOrganizationSchema } from "../../zod/organization/get-by-id-organization-params-schema";
import { DeleteOrganizationSchema } from "../../zod/organization/delete-organization-params-schema";

export type OrganizationWithVenueCount = Organization & {
  _count: {
    venues: number
  }
}

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
  delete: (params: DeleteOrganizationSchema) => Promise<Organization | null>
  list: (params: ListOrganizationQuerySchema) => Promise<OrganizationWithVenueCount[] | null>
  getById: (params: GetByIdOrganizationSchema) => Promise<Organization | null>
  update: (params: UpdateOrganizationRequestParams) => Promise<Organization | null>
  create: (params: CreateOrganizationRequestParams) => Promise<Organization | null>
}
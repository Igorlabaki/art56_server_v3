import { Service } from "@prisma/client";
import { CreateServiceRequestParams } from "../../zod/services/create-service-params-schema";
import { ListServiceRequestQuerySchema } from "../../zod/services/list-service-query-schema";
import { UpdateServiceRequestParams } from "../../zod/services/update-service-params-schema";
import { GetByNameServiceSchema } from "../../zod/services/get-by-name-service-params-schema";

export interface GetByProposalServiceListTotalAmount{
  venueId: string,
  serviceIds: string[]
}
export interface ServiceRepositoryInterface {
  delete: (params: string) => Promise<Service | null>
  getById: (params: string) => Promise<Service | null>
  getByVenueId: (params: string) => Promise<Service[] | null>
  getByName: (params: GetByNameServiceSchema) => Promise<Service | null>
  update: (params: UpdateServiceRequestParams) => Promise<Service | null> 
  create: (params: CreateServiceRequestParams) => Promise<Service | null>
  list: (query: ListServiceRequestQuerySchema) => Promise<Service[]  | null>
  getByProposalServiceListTotalAmount: (params: GetByProposalServiceListTotalAmount) => Promise<number | null>
}
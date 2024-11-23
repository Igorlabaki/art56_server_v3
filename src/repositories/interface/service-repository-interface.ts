import { Service } from "@prisma/client";
import { CreateServiceRequestParams } from "../../zod/services/create-service-params-schema";

export interface GetByProposalServiceListTotalAmount{
  venueId: string,
  serviceIds: string[]
}

export interface ServiceRepositoryInterface {
  list: (params: string) => Promise<Service[]  | null>
  delete: (params: string) => Promise<Service | null>
  getByVenueId: (params: string) => Promise<Service[] | null>
  /* update: (params: UpdateServiceRequestParams) => Promise<Service | null> */
  create: (params: CreateServiceRequestParams) => Promise<Service | null>
  getByProposalServiceListTotalAmount: (params: GetByProposalServiceListTotalAmount) => Promise<number | null>
}
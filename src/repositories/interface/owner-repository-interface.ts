import { Owner, User } from "@prisma/client";
import { CreateOwnerRequestParams } from "../../zod/owner/create-owner-params-schema";


export interface OwnerRepositoryInterface {
  list: (params: string) => Promise<Owner[]  | null>
  delete: (params: string) => Promise<Owner | null>
  getById: (params: string) => Promise<Owner | null>
  /* update: (params: UpdateOwnerRequestParams) => Promise<Owner | null> */
  create: (params: CreateOwnerRequestParams) => Promise<Owner | null>
}
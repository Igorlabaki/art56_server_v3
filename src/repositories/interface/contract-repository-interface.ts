import { Clause, Contract } from "@prisma/client";
import { CreateContractRequestParams } from "../../zod/contract/create-contract-params-schema";
import { ListContractRequestQuerySchema } from "../../zod/contract/list-contract-query-schema";
import { UpdateContractRequestParams } from "../../zod/contract/update-contract-params-schema";

export interface ContractRepositoryInterface {
  delete: (params: string) => Promise<Contract | null>;  
  getById: (params: string) => Promise<Contract | null>;
  getClauseByContract: (params: string) => Promise<{id: string}[] | null> 
  update: (params: UpdateContractRequestParams) => Promise<Contract | null>;
  create: (params: CreateContractRequestParams) => Promise<Contract | null>;
  list: (params: ListContractRequestQuerySchema) => Promise<Contract[]  | null>;
}
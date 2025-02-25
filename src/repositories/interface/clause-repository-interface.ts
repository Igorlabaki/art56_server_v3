import { Clause } from "@prisma/client";
import { CreateClauseRequestParams } from "../../zod/clause/create-clause-params-schema";
import { ListClauseRequestQuerySchema } from "../../zod/clause/list-clause-query-schema";
import { UpdateClauseRequestParams } from "../../zod/clause/update-clause-params-schema";

export interface ClauseRepositoryInterface {
  delete: (params: string) => Promise<Clause | null>;  
  getById: (params: string) => Promise<Clause | null>;
  /* getByClause: (params: string) => Promise<Clause | null> */
  update: (params: UpdateClauseRequestParams) => Promise<Clause | null>;
  create: (params: CreateClauseRequestParams) => Promise<Clause | null>;
  list: (params: ListClauseRequestQuerySchema) => Promise<Clause[]  | null>;
}
import { History } from "@prisma/client";
import { CreateHistoryRequestParams } from "../../zod/history/create-history-params-schema";

export interface HistoryRepositoryInterface {
  create: (params: CreateHistoryRequestParams) => Promise<History | null>
  list: (params: string) => Promise<History[]  | null>
  delete: (params: string) => Promise<History | null>
  getById: (params: string) => Promise<History | null>
}
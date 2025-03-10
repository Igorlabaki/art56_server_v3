import { Expense } from "@prisma/client";
import { UpdateExpenseRequestParams } from "../../zod/expense/update-expense-params-schema";
import { CreateExpenseRequestParams } from "../../zod/expense/create-expense-params-schema";
import { ListExpenseRequestQuerySchema } from "../../zod/expense/list-expense-query-schema";
import { AnalysisExpenseRequestParamSchema } from "../../zod/expense/analysis-expense-param-schema";

export interface ExpenseRepositoryInterface {
  delete: (params: string) => Promise<Expense | null>
  getById: (params: string) => Promise<Expense | null>
  getByVenueId: (params: string) => Promise<Expense[] | null>
  update: (params: UpdateExpenseRequestParams) => Promise<Expense | null> 
  create: (params: CreateExpenseRequestParams) => Promise<Expense | null>
  list: (query: ListExpenseRequestQuerySchema) => Promise<Expense[]  | null>
  getByName: (params: {venueId:string, name: string}) => Promise<Expense | null>
  analyze :(params: AnalysisExpenseRequestParamSchema) => Promise<Expense[]  | null>
}
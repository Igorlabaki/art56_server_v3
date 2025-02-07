import { Expense } from "@prisma/client";
import { UpdateExpenseRequestParams } from "../../zod/expense/update-expense-params-schema";
import { CreateExpenseRequestParams } from "../../zod/expense/create-expense-params-schema";
import { ListExpenseRequestQuerySchema } from "../../zod/expense/list-expense-query-schema";

export interface ExpenseRepositoryInterface {
  delete: (params: string) => Promise<Expense | null>
  getById: (params: string) => Promise<Expense | null>
  getByName: (params: string) => Promise<Expense | null>
  getByVenueId: (params: string) => Promise<Expense[] | null>
  update: (params: UpdateExpenseRequestParams) => Promise<Expense | null> 
  create: (params: CreateExpenseRequestParams) => Promise<Expense | null>
  list: (query: ListExpenseRequestQuerySchema) => Promise<Expense[]  | null>
 
}
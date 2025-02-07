import { PrismaClient, Expense } from "@prisma/client"
import { CreateExpenseRequestParams } from "../../zod/expense/create-expense-params-schema"
import { ExpenseRepositoryInterface } from "../interface/expense-repository-interface"
import { UpdateExpenseRequestParams } from "../../zod/expense/update-expense-params-schema"
import { ListExpenseRequestQuerySchema } from "../../zod/expense/list-expense-query-schema"



export class PrismaExpenseRepository implements ExpenseRepositoryInterface {

    constructor (private readonly prisma: PrismaClient){}
  
    async create (params: CreateExpenseRequestParams): Promise<Expense | null> {
      return await this.prisma.expense.create({
        data:{
          ...params,
        },
      })
    }
  
   async update (reference: UpdateExpenseRequestParams): Promise<Expense  | null> {
      return await this.prisma.expense.update({
        where:{
          id: reference.expenseId
        },
        data:{
          ...reference.data
        }
      })
    } 

    async getByVenueId (reference: string): Promise<Expense [] | null> {
      return await this.prisma.expense.findMany({
        where:{
          venueId: reference
        }
      })
    }

    async getById (reference: string): Promise<Expense | null> {
      return await this.prisma.expense.findFirst({
        where:{
          id: reference
        }
      })
    }

    async getByName (reference: string): Promise<Expense | null> {
      return await this.prisma.expense.findFirst({
        where:{
          name: reference
        }
      })
    }

    async delete (reference: string): Promise<Expense | null> {
      return await this.prisma.expense.delete({
        where:{
            id: reference
        }
      })
    }

    async list ({venueId,name}: ListExpenseRequestQuerySchema): Promise<Expense[] | null> {
      return await this.prisma.expense.findMany({
        where: {
          venueId,
          ...(name && {
            name: {
              contains: name
            }
          }),
        },
      })
    }
  }
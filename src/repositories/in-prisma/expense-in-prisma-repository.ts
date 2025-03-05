import { PrismaClient, Expense } from "@prisma/client"
import { CreateExpenseRequestParams } from "../../zod/expense/create-expense-params-schema"
import { ExpenseRepositoryInterface } from "../interface/expense-repository-interface"
import { UpdateExpenseRequestParams } from "../../zod/expense/update-expense-params-schema"
import { ListExpenseRequestQuerySchema } from "../../zod/expense/list-expense-query-schema"
import { AnalysisExpenseRequestParamSchema } from "../../zod/expense/analysis-expense-param-schema"



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

    async getByName ({name,venueId}: {venueId:string, name: string}): Promise<Expense | null> {
      return await this.prisma.expense.findFirst({
        where:{
          name: name,
          venueId: venueId
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

    async analyze({venueId,year}:AnalysisExpenseRequestParamSchema): Promise<Expense[] | null> {
      return await this.prisma.expense.findMany({
        where: {
          venueId,
          OR: [
            {
              recurring: true, // Todos os recorrentes (independente do ano)
            },
            {
              recurring: false, // Somente os não recorrentes do ano escolhido
              paymentDate: {
                gte: new Date(year ? Number(year) : new Date().getFullYear(),0,1),
                lt: new Date(year ? Number(year) : new Date().getFullYear(), 12, 31),
              },
            },
          ],
        },
      });
    }
  }
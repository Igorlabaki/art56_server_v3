
import { AnalysisExpenseRequestParamSchema } from "../../../zod/expense/analysis-expense-param-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ExpenseRepositoryInterface } from "../../../repositories/interface/expense-repository-interface";
import { Expense } from "@prisma/client";

class AnalysisExpenseUseCase {
    constructor(private expenseRepository: ExpenseRepositoryInterface) { }

    async execute(params : AnalysisExpenseRequestParamSchema) {

        const analysisdExpense = await this.expenseRepository.analyze(params)

        const analysis: {
            total: {
              monthly: number;
              annual: number;
              esporadic: number;
            };
            recurring: ExpenseRecurring[];
            esporadic: ExpenseEsporadic[];
        } = {
            total: {
              monthly: 0,
              annual: 0,
              esporadic: 0,
            },
            recurring: [],
            esporadic: [],
        };

          type ExpenseRecurring = {
            name: string;
            monthly: number;
            annual: number;
          }

          type ExpenseEsporadic = {
            name: string;
            total: number
          }
      
          const recorringMap: { [name: string]: ExpenseRecurring } = {};
          const esporadicMap: { [name: string]: ExpenseEsporadic } = {};
      
          analysisdExpense?.forEach((item: Expense) => {
            let mensalValue = 0;
            let anualValue = 0;
      
            if (item.recurring) {
              if (!recorringMap[item.name]) {
                recorringMap[item.name] = {
                  name: item.name,
                  monthly: 0,
                  annual: 0,
                };
              }
      
              if (item.type === "MONTHLY") {
                mensalValue = item.amount;
                anualValue = item.amount * 12;
              } else if (item.type === "BIWEEKLY") {
                mensalValue = item.amount * 2;
                anualValue = item.amount * 24;
              }else if (item.type === "ANNUAL") {
                mensalValue = item.amount / 12;
                anualValue = item.amount;
              }
      
              recorringMap[item.name].monthly += mensalValue;
              recorringMap[item.name].annual += anualValue;
      
              analysis.total.monthly += mensalValue;
              analysis.total.annual += anualValue;
            } else {
              if (!esporadicMap[item.name]) {
                esporadicMap[item.name] = {
                  name: item.name,
                  total: 0,
                };
              }
      
              esporadicMap[item.name].total += item.amount;
              analysis.total.esporadic += item.amount;
            }
          });
      
          // Ordenar recorrentes por ordem decrescente anual
          analysis.recurring = Object.values(recorringMap).sort(
            (a, b) => b.annual - a.annual
          );
      
          // Ordenar esporádicos por ordem decrescente total
          analysis.esporadic = Object.values(esporadicMap).sort(
            (a, b) => b.total - a.total
          );
      

        const formatedResponse = {
            success: true,
            message: `Analise de despesa feita com sucesso`,
            data: {
                ...analysis
            },
            count: 1,
            type: "Expense"
        }

        return formatedResponse
    }
}

export { AnalysisExpenseUseCase }

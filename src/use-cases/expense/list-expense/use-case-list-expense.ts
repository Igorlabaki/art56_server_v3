
import { ListExpenseRequestQuerySchema } from "../../../zod/expense/list-expense-query-schema";
import { ExpenseRepositoryInterface } from "../../../repositories/interface/expense-repository-interface";

class ListExpensesUseCase {
  constructor(private expenseRepository: ExpenseRepositoryInterface) { }

  async execute(query: ListExpenseRequestQuerySchema) {
    const expenseList = await this.expenseRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de despesa com ${expenseList?.length} items`,
      data: {
        expenseList: expenseList
      },
      count: expenseList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListExpensesUseCase };

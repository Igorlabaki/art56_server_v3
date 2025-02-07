

import { DeleteExpenseRequestParamSchema } from "../../../zod/expense/delete-expense-param-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ExpenseRepositoryInterface } from "../../../repositories/interface/expense-repository-interface";

class DeleteExpenseUseCase {
    constructor(private expenseRepository: ExpenseRepositoryInterface) { }

    async execute({ expenseId }: DeleteExpenseRequestParamSchema) {

        // Validate if expense exists
        const expense = await this.expenseRepository.getById(expenseId)

        if (!expense) {
            throw new HttpResourceNotFoundError("Despesa")
        }
        //

        const deletedExpense = await this.expenseRepository.delete(expenseId)

        const formatedResponse = {
            success: true,
            message: `Despesa deletada com sucesso`,
            data: {
                ...deletedExpense
            },
            count: 1,
            type: "Expense"
        }

        return formatedResponse
    }
}

export { DeleteExpenseUseCase }


import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { UpdateExpenseRequestParams } from "../../../zod/expense/update-expense-params-schema"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { ExpenseRepositoryInterface } from "../../../repositories/interface/expense-repository-interface"

class UpdateExpenseUseCase {
    constructor(private expenseRepository: ExpenseRepositoryInterface) { }

    async execute(param: UpdateExpenseRequestParams) {
        // Validate if expense exists
        const expense = await this.expenseRepository.getById(param.expenseId)

        if (!expense) {
            throw new HttpResourceNotFoundError("Despesa")
        }
        //
        if (param.data.paymentDate) {
            param.data.paymentDate = new Date(param.data.paymentDate).toISOString();
        }


        const updatedExpense = await this.expenseRepository.update(param)

        if (!updatedExpense) {
            throw new HttpConflictError("Despesa")
        }

        const formatedResponse = {
            success: true,
            message: `Despesa atualizado(a) com sucesso`,
            data: {
                ...updatedExpense
            },
            count: 1,
            type: "Expense"
        }

        return formatedResponse
    }
}

export { UpdateExpenseUseCase }

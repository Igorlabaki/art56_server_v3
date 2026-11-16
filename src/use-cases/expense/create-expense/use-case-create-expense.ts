import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { CreateExpenseRequestParams } from "../../../zod/expense/create-expense-params-schema"
import { ExpenseRepositoryInterface } from "../../../repositories/interface/expense-repository-interface"
import { resolveExpenseTrafficSource } from "../../../functions/expense-recurrence"

class CreateExpenseUseCase {
    constructor(
        private expenseRepository: ExpenseRepositoryInterface,
    ) { }

    async execute(params: CreateExpenseRequestParams) {

        const expenseAlreadyExists = await this.expenseRepository.getByName({
            name: params.name,
            venueId: params.venueId
        })

        if (expenseAlreadyExists) {
            throw new HttpConflictError("Despesa")
        }

        const trafficSource = resolveExpenseTrafficSource(params.category, params.trafficSource)

        // Validate if user exists
        const newExpense = await this.expenseRepository.create({ ...params, trafficSource })

        if (!newExpense) {
            throw new HttpConflictError("Despesa")
        }
        //

        const formatedResponse = {
            success: true,
            message: "Despesa foi criada com sucesso",
            data: {
                ...newExpense
            },
            count: 1,
            type: "Despesa"
        }

        return formatedResponse
    }
}

export { CreateExpenseUseCase }
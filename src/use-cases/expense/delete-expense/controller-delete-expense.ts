import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteExpenseUseCase } from "./use-case-delete-expense";
import { deleteExpenseRequestParamSchema } from "../../../zod/expense/delete-expense-param-schema";

class DeleteExpenseController {
    constructor(private deleteExpenseUseCase: DeleteExpenseUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteExpenseRequestParamSchema.parse(req.params);

            const expenseById = await this.deleteExpenseUseCase.execute(param);

            return resp.json(expenseById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteExpenseController }

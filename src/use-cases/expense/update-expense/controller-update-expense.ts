import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateExpenseUseCase } from "./use-case-update-expense";
import { updateExpenseSchema } from "../../../zod/expense/update-expense-params-schema";

class UpdateExpenseController {
    constructor(private updateExpenseUseCase: UpdateExpenseUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateExpenseSchema.parse(req.body);

            const expenseById = await this.updateExpenseUseCase.execute(param);
            
            return resp.json(expenseById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateExpenseController }

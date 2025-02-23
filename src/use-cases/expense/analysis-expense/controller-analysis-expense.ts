import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { AnalysisExpenseUseCase } from "./use-case-analysis-expense";
import { analysisExpenseRequestParamSchema } from "../../../zod/expense/analysis-expense-param-schema";

class AnalysisExpenseController {
    constructor(private analysisExpenseUseCase: AnalysisExpenseUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = analysisExpenseRequestParamSchema.parse(req.query);

            const expenseById = await this.analysisExpenseUseCase.execute(param);

            return resp.json(expenseById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { AnalysisExpenseController }

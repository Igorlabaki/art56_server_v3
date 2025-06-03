import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateExpenseUseCase } from "./use-case-create-expense";
import { createExpenseRequestParams, CreateExpenseRequestParams } from "../../../zod/expense/create-expense-params-schema";

class CreateExpenseController {
    constructor(private createExpenseUseCase: CreateExpenseUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateExpenseRequestParams = req.body;

            // Converte paymentDate para ISO-8601 se existir
            if (body.paymentDate) {
                body.paymentDate = new Date(body.paymentDate).toISOString();
            }

            // Validate the request parms
            console.log("[CreateExpense] Body:", body);
            createExpenseRequestParams.parse(body);
            console.log("[CreateExpense] Parsed body:", body);

            // Esperar a execução do caso de uso
            const response = await this.createExpenseUseCase.execute(body);
            // Retornar o token
            console.log("[CreateExpense] Response:", response);
         
            return resp.status(201).json(response);

        } catch (error) {  
            console.log("[CreateExpense] Error:", error);
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateExpenseController };
import { Request, Response } from "express";
import { CreatePaymentUseCase } from "./use-case-create-payment";
import { handleErrors } from "../../../errors/error-handler";
import { CreatePaymentRequestParams, createPaymentSchema } from "../../../zod/payment/create-payment-params-schema";

class CreatePaymentController {
  constructor(private createPaymentUseCase: CreatePaymentUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreatePaymentRequestParams = req.body;
        // Validate the request parms
        createPaymentSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createPaymentUseCase.execute(body);
        // Retornar o token
        return resp.status(201).json(response);

    } catch (error) {
        // Chamar o handleErrors para formatar o erro
        const errorResponse = handleErrors(error);

        // Retornar a resposta formatada
        return resp.status(errorResponse.statusCode).json(errorResponse.body);
    }
}
}

export { CreatePaymentController };

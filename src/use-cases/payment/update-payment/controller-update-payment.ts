import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { UpdatePaymentUseCase } from "./use-case-update-payment";
import { updatePaymentSchema } from "../../../zod/payment/update-payment-params-schema";

class UpdatePaymentController {
    constructor(private updatePaymentUseCase: UpdatePaymentUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updatePaymentSchema.parse(req.body);

            const paymentById = await this.updatePaymentUseCase.execute(param);
            
            return resp.json(paymentById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdatePaymentController }

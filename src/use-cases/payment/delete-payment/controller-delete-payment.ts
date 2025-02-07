import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeletePaymentUseCase } from "./use-case-delete-payment";

class DeletePaymentController {
    constructor(private deletePaymentUseCase: DeletePaymentUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const {paymentId} = req.params;

            const paymentById = await this.deletePaymentUseCase.execute(paymentId);
            
            return resp.json(paymentById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeletePaymentController }

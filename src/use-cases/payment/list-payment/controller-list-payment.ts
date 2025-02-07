import { Request, Response } from 'express';
import { ListPaymentsUseCase } from './use-case-list-payment';
import { handleErrors } from '../../../errors/error-handler';
import { listPaymentRequestQuerySchema, ListPaymentRequestQuerySchema } from '../../../zod/payment/list-payment-query-schema';

class ListPaymentController {
  constructor(private listPaymentsUseCase: ListPaymentsUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListPaymentRequestQuerySchema = listPaymentRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listPaymentsUseCase.execute(query);
      // Retornar o token
      return resp.status(200).json(response);
    } catch (error) {
      // Chamar o handleErrors para formatar o erro
      const errorResponse = handleErrors(error);
      // Retornar a resposta formatada
      return resp.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
}

export { ListPaymentController };

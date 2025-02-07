import { Request, Response } from 'express';
import { handleErrors } from '../../../errors/error-handler';
import { ListDateEventsUseCase } from './use-case-list-date-event';
import { listDateEventRequestQuerySchema, ListDateEventRequestQuerySchema } from '../../../zod/dataEvent/list-date-event-query-schema';

class ListDateEventController {
  constructor(private listDateEventsUseCase: ListDateEventsUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListDateEventRequestQuerySchema = listDateEventRequestQuerySchema
        .parse(req.query);

      // Esperar a execução do caso de uso
      const response = await this.listDateEventsUseCase.execute(query);
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

export { ListDateEventController };

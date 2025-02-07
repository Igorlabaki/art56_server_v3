import { Request, Response } from 'express';
import { handleErrors } from '../../../errors/error-handler';
import { ListNotificationsUseCase } from './use-case-list-notification';
import { listNotificationRequestQuerySchema, ListNotificationRequestQuerySchema } from '../../../zod/notification/list-notification-query-schema';

class ListNotificationController {
  constructor(private listNotificationsUseCase: ListNotificationsUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const { venueId }  = req.params
      // Esperar a execução do caso de uso
      const response = await this.listNotificationsUseCase.execute(venueId);
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

export { ListNotificationController };

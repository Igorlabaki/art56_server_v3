import { Request, Response } from 'express';
import { handleErrors } from '../../../errors/error-handler';
import { ListSchedulesUseCase } from './use-case-list-schedule';
import { listScheduleRequestQuerySchema, ListScheduleRequestQuerySchema } from '../../../zod/schedule/list-schedule-query-schema';

class ListScheduleController {
  constructor(private listSchedulesUseCase: ListSchedulesUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListScheduleRequestQuerySchema = listScheduleRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listSchedulesUseCase.execute(query);
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

export { ListScheduleController };

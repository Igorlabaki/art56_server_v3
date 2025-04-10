import { Request, Response } from 'express';
import { ListGoalsUseCase } from './use-case-list-goal';
import { handleErrors } from '../../../errors/error-handler';
import { listGoalRequestQuerySchema, ListGoalRequestQuerySchema } from '../../../zod/goal/list-goal-query-schema';

class ListGoalController {
  constructor(private listGoalsUseCase: ListGoalsUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListGoalRequestQuerySchema = listGoalRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listGoalsUseCase.execute(query);
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

export { ListGoalController };

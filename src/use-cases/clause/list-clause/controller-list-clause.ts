import { Request, Response } from 'express';
import { ListClausesUseCase } from './use-case-list-clause';
import { handleErrors } from '../../../errors/error-handler';
import { listClauseRequestQuerySchema, ListClauseRequestQuerySchema } from '../../../zod/clause/list-clause-query-schema';

class ListClauseController {
  constructor(private listClausesUseCase: ListClausesUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListClauseRequestQuerySchema = listClauseRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listClausesUseCase.execute(query);
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

export { ListClauseController };

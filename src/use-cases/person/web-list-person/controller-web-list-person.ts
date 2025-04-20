import { Request, Response } from 'express';
import { ListWebPersonsUseCase } from './use-case-web-list-person';
import { handleErrors } from '../../../errors/error-handler';
import { listPersonRequestQuerySchema, ListPersonRequestQuerySchema } from '../../../zod/person/list-person-query-schema';

class ListWebPersonController {
  constructor(private listWebPersonsUseCase: ListWebPersonsUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListPersonRequestQuerySchema = listPersonRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listWebPersonsUseCase.execute(query);
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

export { ListWebPersonController };

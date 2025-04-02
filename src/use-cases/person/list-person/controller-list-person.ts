import { Request, Response } from 'express';
import { ListPersonsUseCase } from './use-case-list-person';
import { handleErrors } from '../../../errors/error-handler';
import { listPersonRequestQuerySchema, ListPersonRequestQuerySchema } from '../../../zod/person/list-person-query-schema';

class ListPersonController {
  constructor(private listPersonsUseCase: ListPersonsUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      console.log(req.query)
      const query: ListPersonRequestQuerySchema = listPersonRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listPersonsUseCase.execute(query);
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

export { ListPersonController };

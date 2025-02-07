import { Request, Response } from 'express';
import { ListTextsUseCase } from './use-case-list-text';
import { handleErrors } from '../../../errors/error-handler';
import { listTextRequestQuerySchema, ListTextRequestQuerySchema } from '../../../zod/text/list-text-query-schema';

class ListTextController {
  constructor(private listTextsUseCase: ListTextsUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListTextRequestQuerySchema = listTextRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listTextsUseCase.execute(query);
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

export { ListTextController };

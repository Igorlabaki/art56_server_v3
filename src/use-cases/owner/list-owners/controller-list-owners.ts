import { Request, Response } from 'express';

import { handleErrors } from '../../../errors/error-handler';

import { listOwnerQuerySchema, ListOwnerQuerySchema } from '../../../zod/owner/list-owner-params-schema';
import { ListOwnerUseCase } from './use-case-list-owners';

class ListOwnerController {
  constructor(private listOwnerUseCase: ListOwnerUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListOwnerQuerySchema = listOwnerQuerySchema.parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listOwnerUseCase.execute(query);
    
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

export { ListOwnerController };

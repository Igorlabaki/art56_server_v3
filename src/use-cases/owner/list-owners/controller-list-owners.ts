import { Response } from 'express';

import { handleErrors } from '../../../errors/error-handler';
import { AuthenticatedRequest } from '../../../types/authenticated-request';

import { listOwnerQuerySchema, ListOwnerQuerySchema } from '../../../zod/owner/list-owner-params-schema';
import { ListOwnerUseCase } from './use-case-list-owners';

class ListOwnerController {
  constructor(private listOwnerUseCase: ListOwnerUseCase) { }

  async handle(req: AuthenticatedRequest, resp: Response) {
    try {
      const query: ListOwnerQuerySchema = listOwnerQuerySchema.parse(req.query);

      const response = await this.listOwnerUseCase.execute(req.user?.id, query);
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

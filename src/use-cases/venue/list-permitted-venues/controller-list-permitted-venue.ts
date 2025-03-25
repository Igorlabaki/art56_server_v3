import { Request, Response } from 'express';

import { handleErrors } from '../../../errors/error-handler';
import { ListPermittedVenuesUseCase } from './use-case-list-permitted-venue';
import { listPermittedVenueRequestQuerySchema, ListPermittedVenueRequestQuerySchema } from '../../../zod/venue/list-venue-permitted-query-schema';

class ListPermittedVenueController {
  constructor(private listPermittedVenuesUseCase: ListPermittedVenuesUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListPermittedVenueRequestQuerySchema = listPermittedVenueRequestQuerySchema
        .parse(req.query);

      // Esperar a execução do caso de uso
      const response = await this.listPermittedVenuesUseCase.execute(query);
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

export { ListPermittedVenueController };

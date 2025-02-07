import { Request, Response } from 'express';
import { ListVenuesUseCase } from './use-case-list-venue';
import { handleErrors } from '../../../errors/error-handler';
import { listVenueRequestQuerySchema, ListVenueRequestQuerySchema } from '../../../zod/venue/list-venue-query-schema';

class ListVenueController {
  constructor(private listVenuesUseCase: ListVenuesUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListVenueRequestQuerySchema = listVenueRequestQuerySchema
        .parse(req.query);

      // Esperar a execução do caso de uso
      const response = await this.listVenuesUseCase.execute(query);
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

export { ListVenueController };

import { Response } from 'express';
import { handleErrors } from '../../../errors/error-handler';
import { AuthenticatedRequest } from '../../../types/authenticated-request';
import { listOwnerByVenueIdQuerySchema, ListOwnerByVenueIdQuerySchema } from '../../../zod/owner/list-owners-by-venue-params-schema';
import { ListOwnerByVenueIdUseCase } from './use-case-list-by-venueId-owners';

class ListOwnerByVenueIdController {
  constructor(private listOwnerByVenueIdUseCase: ListOwnerByVenueIdUseCase) { }

  async handle(req: AuthenticatedRequest, resp: Response) {
    try {
      const query: ListOwnerByVenueIdQuerySchema = listOwnerByVenueIdQuerySchema.parse(req.query); 

      const response = await this.listOwnerByVenueIdUseCase.execute(req.user?.id, query);
      return resp.status(200).json(response);

    } catch (error) {
      // Chamar o handleErrors para formatar o erro
      const errorResponse = handleErrors(error);

      // Retornar a resposta formatada
      return resp.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
}

export { ListOwnerByVenueIdController };

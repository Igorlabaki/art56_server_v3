import { Request, Response } from 'express';
import { handleErrors } from '../../../errors/error-handler';
import { ListUserVenuePermissionUseCase } from './use-case-list-user-venue-permission';
import { listUserVenuePermissionByUserRequestQuerySchema, ListUserVenuePermissionByUserRequestQuerySchema } from '../../../zod/user-venue-permission/list-user-venue-permission-by-query-schema';

class ListUserVenuePermissionController {
  constructor(private listUserVenuePermissionsUseCase: ListUserVenuePermissionUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListUserVenuePermissionByUserRequestQuerySchema = listUserVenuePermissionByUserRequestQuerySchema
        .parse(req.query);

      // Esperar a execução do caso de uso
      const response = await this.listUserVenuePermissionsUseCase.execute(query);
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

export { ListUserVenuePermissionController };

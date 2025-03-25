import { Request, Response } from 'express';
import { handleErrors } from '../../../errors/error-handler';
import { ListUserPermissionUseCase } from './use-case-list-user-permission';
import { listUserPermissionByUserRequestQuerySchema, ListUserPermissionByUserRequestQuerySchema } from '../../../zod/user-permission/list-user-permission-by-query-schema';



class ListUserPermissionController {
  constructor(private listUserPermissionsUseCase: ListUserPermissionUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListUserPermissionByUserRequestQuerySchema = listUserPermissionByUserRequestQuerySchema
        .parse(req.query);

      // Esperar a execução do caso de uso
      const response = await this.listUserPermissionsUseCase.execute(query);
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

export { ListUserPermissionController };

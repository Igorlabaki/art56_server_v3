import { Request, Response } from 'express';
import { handleErrors } from '../../../errors/error-handler';
import { ListUserOrganizationPermissionUseCase } from './use-case-list-user-organization-permission';
import { listUserOrganizationPermissionByUserRequestQuerySchema, ListUserOrganizationPermissionByUserRequestQuerySchema } from '../../../zod/user-organization-permission/list-user-organization-permission-by-query-schema';

class ListUserOrganizationPermissionController {
  constructor(private listUserOrganizationPermissionsUseCase: ListUserOrganizationPermissionUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListUserOrganizationPermissionByUserRequestQuerySchema = listUserOrganizationPermissionByUserRequestQuerySchema
        .parse(req.query);

      // Esperar a execução do caso de uso
      const response = await this.listUserOrganizationPermissionsUseCase.execute(query);
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

export { ListUserOrganizationPermissionController };

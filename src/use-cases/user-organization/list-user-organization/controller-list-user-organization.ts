import { Request, Response } from 'express';

import { handleErrors } from '../../../errors/error-handler';
import { ListUserOrganizationUseCase } from './use-case-list-user-organization';
import { listUserOrganizationRequestQuerySchema, ListUserOrganizationRequestQuerySchema } from '../../../zod/user-organization/list-user-organization-query-schema';


class ListUserOrganizationController {
  constructor(private listUserOrganizationsUseCase: ListUserOrganizationUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListUserOrganizationRequestQuerySchema = listUserOrganizationRequestQuerySchema
        .parse(req.query);

      // Esperar a execução do caso de uso
      const response = await this.listUserOrganizationsUseCase.execute(query);

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

export { ListUserOrganizationController };

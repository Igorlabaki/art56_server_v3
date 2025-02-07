import { Request, Response } from 'express';

import { handleErrors } from '../../../errors/error-handler';
import { ListOrganizationUseCase } from './use-case-list-organization';
import { listOrganizationQuerySchema, ListOrganizationQuerySchema } from '../../../zod/organization/list-organization-params-schema';

class ListOrganizationController {
  constructor(private listOrganizationUseCase: ListOrganizationUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListOrganizationQuerySchema = listOrganizationQuerySchema.parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listOrganizationUseCase.execute(query);
    
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

export { ListOrganizationController };

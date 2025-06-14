import { Request, Response } from 'express';

import { handleErrors } from '../../../errors/error-handler';
import { listTextRequestQuerySchema, ListTextRequestQuerySchema } from '../../../zod/text/list-text-query-schema';
import { ListTextOrganizationUseCase } from './use-case-list-text-organization';
import { listTextOrganizationRequestQuerySchema } from '../../../zod/text-organization/list-text-organizations-query-schema';
import { ListTextOrganizationRequestQuerySchema } from '../../../zod/text-organization/list-text-organizations-query-schema';

class ListTextOrganizationController {
  constructor(private listTextOrganizationUseCase: ListTextOrganizationUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListTextOrganizationRequestQuerySchema = listTextOrganizationRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listTextOrganizationUseCase.execute(query);
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

export { ListTextOrganizationController };

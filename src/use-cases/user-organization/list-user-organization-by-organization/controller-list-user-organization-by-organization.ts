import { Request, Response } from 'express';
import { handleErrors } from '../../../errors/error-handler';
import { ListUserOrganizationByOrganizationUseCase } from './use-case-list-user-organization-by-organization';
import { listUserOrganizationByOrganizationRequestQuerySchema, ListUserOrganizationByOrganizationRequestQuerySchema } from '../../../zod/user-organization/list-user-organization-by-organization-query-schema';



class ListUserOrganizationByOrganizationController {
  constructor(private listUserOrganizationByOrganizationUseCase: ListUserOrganizationByOrganizationUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListUserOrganizationByOrganizationRequestQuerySchema = listUserOrganizationByOrganizationRequestQuerySchema
        .parse(req.query);

      // Esperar a execução do caso de uso
      const response = await this.listUserOrganizationByOrganizationUseCase.execute(query);
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

export { ListUserOrganizationByOrganizationController };

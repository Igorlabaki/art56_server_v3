import { Request, Response } from 'express';
import { ListImagesOrganizationUseCase } from './use-case-list-image-organization';
import { handleErrors } from '../../../errors/error-handler';
import { listImageOrganizationRequestQuerySchema } from '../../../zod/image-organization/list-image-organization-query-schema';
import { ListImageOrganizationRequestQuerySchema } from '../../../zod/image-organization/list-image-organization-query-schema';


class ListImageOrganizationController {
  constructor(private listImagesOrganizationUseCase: ListImagesOrganizationUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      console.log(req.query);
      const query: ListImageOrganizationRequestQuerySchema = listImageOrganizationRequestQuerySchema
        .parse(req.query);
        console.log(query);
      // Esperar a execução do caso de uso
      const response = await this.listImagesOrganizationUseCase.execute(query);
      // Retornar o token
      return resp.status(200).json(response);
    } catch (error) {
      console.log(error);
      // Chamar o handleErrors para formatar o erro
      const errorResponse = handleErrors(error);
      // Retornar a resposta formatada
      console.log(errorResponse);
      return resp.status(errorResponse.statusCode).json(errorResponse.body);
    }
  }
}

export { ListImageOrganizationController };

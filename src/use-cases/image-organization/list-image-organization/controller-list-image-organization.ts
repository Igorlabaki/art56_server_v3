import { Request, Response } from 'express';
import { ListImagesOrganizationUseCase } from './use-case-list-image-organization';
import { handleErrors } from '../../../errors/error-handler';
import { listImageOrganizationRequestQuerySchema, ListImageOrganizationRequestQuerySchema } from '../../../zod/image-organization/list-image-organization-query-schema';

class ListImageController {
  constructor(private listImagesOrganizationUseCase: ListImagesOrganizationUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListImageOrganizationRequestQuerySchema = listImageOrganizationRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listImagesOrganizationUseCase.execute(query);
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

export { ListImageController };

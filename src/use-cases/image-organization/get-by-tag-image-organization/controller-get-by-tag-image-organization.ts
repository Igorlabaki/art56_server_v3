import { Request, Response } from 'express';
import { GetByTagImagesOrganizationUseCase } from './use-case-get-by-tag-image-organization';
import { handleErrors } from '../../../errors/error-handler';
import { getByTagImageRequestQuerySchema, GetByTagImageRequestQuerySchema } from '../../../zod/image/get-by-tag-image-query-schema';
import { GetByTagImageOrganizationRequestQuerySchema } from '../../../zod/image-organization/get-by-tag-image-organization-query-schema';
import { getByTagImageOrganizationRequestQuerySchema } from '../../../zod/image-organization/get-by-tag-image-organization-query-schema';

class GetByTagImageOrganizationController {
  constructor(private getbytagImagesOrganizationUseCase: GetByTagImagesOrganizationUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: GetByTagImageOrganizationRequestQuerySchema = getByTagImageOrganizationRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.getbytagImagesOrganizationUseCase.execute(query);
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

export { GetByTagImageOrganizationController };

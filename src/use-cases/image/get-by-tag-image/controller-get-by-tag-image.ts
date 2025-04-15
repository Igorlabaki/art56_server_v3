import { Request, Response } from 'express';
import { GetByTagImagesUseCase } from './use-case-get-by-tag-image';
import { handleErrors } from '../../../errors/error-handler';
import { getByTagImageRequestQuerySchema, GetByTagImageRequestQuerySchema } from '../../../zod/image/get-by-tag-image-query-schema';

class GetByTagImageController {
  constructor(private getbytagImagesUseCase: GetByTagImagesUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: GetByTagImageRequestQuerySchema = getByTagImageRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.getbytagImagesUseCase.execute(query);
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

export { GetByTagImageController };

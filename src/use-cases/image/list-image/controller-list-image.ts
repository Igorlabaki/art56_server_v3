import { Request, Response } from 'express';
import { ListImagesUseCase } from './use-case-list-image';
import { handleErrors } from '../../../errors/error-handler';
import { listImageRequestQuerySchema, ListImageRequestQuerySchema } from '../../../zod/image/list-image-query-schema';

class ListImageController {
  constructor(private listImagesUseCase: ListImagesUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListImageRequestQuerySchema = listImageRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listImagesUseCase.execute(query);
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

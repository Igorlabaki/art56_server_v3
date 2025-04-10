import { Request, Response } from 'express';
import { ListAttachmentsUseCase } from './use-case-list-attachment';
import { handleErrors } from '../../../errors/error-handler';
import { listAttachmentRequestQuerySchema, ListAttachmentRequestQuerySchema } from '../../../zod/attachment/list-attachment-query-schema';

class ListAttachmentController {
  constructor(private listAttachmentsUseCase: ListAttachmentsUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListAttachmentRequestQuerySchema = listAttachmentRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listAttachmentsUseCase.execute(query);
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

export { ListAttachmentController };

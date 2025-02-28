import { Request, Response } from 'express';
import { handleErrors } from '../../../errors/error-handler';
import { ListDocumentsUseCase } from './use-case-list-document';
import { listDocumentRequestQuerySchema, ListDocumentRequestQuerySchema } from '../../../zod/document/list-document-query-schema';

class ListDocumentController {
  constructor(private listDocumentsUseCase: ListDocumentsUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListDocumentRequestQuerySchema = listDocumentRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listDocumentsUseCase.execute(query);
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

export { ListDocumentController };

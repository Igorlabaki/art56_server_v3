import { Request, Response } from 'express';
import { ListContactsUseCase } from './use-case-list-contact';
import { handleErrors } from '../../../errors/error-handler';
import { listContactRequestQuerySchema, ListContactRequestQuerySchema } from '../../../zod/contact/list-contact-query-schema';

class ListContactController {
  constructor(private listContactsUseCase: ListContactsUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListContactRequestQuerySchema = listContactRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listContactsUseCase.execute(query);
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

export { ListContactController };

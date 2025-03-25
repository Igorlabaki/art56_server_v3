import { Request, Response } from 'express';
import { ListUsersUseCase } from './use-case-list-user';
import { handleErrors } from '../../../errors/error-handler';
import { listUserRequestQuerySchema, ListUserRequestQuerySchema } from '../../../zod/user/list-user-query-schema';

class ListUserController {
  constructor(private listUsersUseCase: ListUsersUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListUserRequestQuerySchema = listUserRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listUsersUseCase.execute(query);

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

export { ListUserController };

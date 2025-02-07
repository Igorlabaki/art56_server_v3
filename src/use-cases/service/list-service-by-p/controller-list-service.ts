import { Request, Response } from 'express';

import { handleErrors } from '../../../errors/error-handler';
import { ListServicesUseCase } from './use-case-list-venue';
import { listServiceRequestQuerySchema, ListServiceRequestQuerySchema } from '../../../zod/services/list-service-query-schema';

class ListServiceController {
  constructor(private listServicesUseCase: ListServicesUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListServiceRequestQuerySchema = listServiceRequestQuerySchema
        .parse(req.query);

      // Esperar a execução do caso de uso
      const response = await this.listServicesUseCase.execute(query);
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

export { ListServiceController };

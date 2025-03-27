import { Request, Response } from 'express';
import { handleErrors } from '../../../errors/error-handler';
import { listSeasonalFeeRequestQuerySchema, ListSeasonalFeeRequestQuerySchema } from '../../../zod/seasonalFee/list-seasonal-fee-query-schema';
import { ListSeasonalFeesUseCase } from './use-case-list-seasonal-fee';


class ListSeasonalFeeController {
  constructor(private listSeasonalFeesUseCase: ListSeasonalFeesUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
     
      const query: ListSeasonalFeeRequestQuerySchema = listSeasonalFeeRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listSeasonalFeesUseCase.execute(query);

      console.log(response)
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

export { ListSeasonalFeeController };

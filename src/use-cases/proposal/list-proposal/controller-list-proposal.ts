import { Request, Response } from 'express';

import { handleErrors } from '../../../errors/error-handler';
import { ListProposalUseCase } from './use-case-list-proposal';
import { listProposalRequestQuerySchema, ListProposalRequestQuerySchema } from '../../../zod/proposal/list-proposal-query-schema';

class ListProposalController {
  constructor(private listProposalsUseCase: ListProposalUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListProposalRequestQuerySchema = listProposalRequestQuerySchema
        .parse(req.query);

      // Esperar a execução do caso de uso
      const response = await this.listProposalsUseCase.execute(query);
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

export { ListProposalController };

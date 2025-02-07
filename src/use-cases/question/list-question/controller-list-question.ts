import { Request, Response } from 'express';
import { ListQuestionsUseCase } from './use-case-list-question';
import { handleErrors } from '../../../errors/error-handler';
import { listQuestionRequestQuerySchema, ListQuestionRequestQuerySchema } from '../../../zod/question/list-question-query-schema';

class ListQuestionController {
  constructor(private listQuestionsUseCase: ListQuestionsUseCase) { }

  async handle(req: Request, resp: Response) {
    try {
      const query: ListQuestionRequestQuerySchema = listQuestionRequestQuerySchema
        .parse(req.query);
      // Esperar a execução do caso de uso
      const response = await this.listQuestionsUseCase.execute(query);
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

export { ListQuestionController };

import { ListClauseRequestQuerySchema } from "../../../zod/clause/list-clause-query-schema";
import { ClauseRepositoryInterface } from "../../../repositories/interface/clause-repository-interface";

class ListClausesUseCase {
  constructor(private clauseRepository: ClauseRepositoryInterface) { }

  async execute(query: ListClauseRequestQuerySchema) {
    const clauseList = await this.clauseRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de clausulas com ${clauseList?.length} items`,
      data: {
        clauseList: clauseList
      },
      count: clauseList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListClausesUseCase };

import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { ClauseRepositoryInterface } from "../../../repositories/interface/clause-repository-interface";
import { CreateClauseRequestParams } from "../../../zod/clause/create-clause-params-schema";

class CreateClauseUseCase {
  constructor(private clauseRepository: ClauseRepositoryInterface) {}

  async execute(params: CreateClauseRequestParams) {
    const newClause = await this.clauseRepository.create(params);

    const formatedResponse = {
      success: true,
      message: "Clausula foi cadastrada com sucesso",
      data: {
         ...newClause
      },
      count: 1,
      type: "Clause"
  } 

  return formatedResponse
  }
}

export { CreateClauseUseCase };

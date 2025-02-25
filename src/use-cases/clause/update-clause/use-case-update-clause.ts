import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UpdateClauseRequestParams } from "../../../zod/clause/update-clause-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ClauseRepositoryInterface } from "../../../repositories/interface/clause-repository-interface";

class UpdateClauseUseCase {
    constructor(private clauseRepository: ClauseRepositoryInterface) { }

    async execute(param: UpdateClauseRequestParams) {
      
        // Validate if clause exists
        const clause = await this.clauseRepository.getById(param.clauseId)

        if (!clause) {
            throw new HttpResourceNotFoundError("Clausula")
        }
        //

        const updatedClause = await this.clauseRepository.update(param)

        if (!updatedClause) {
            throw new HttpConflictError("Clausula")
        }

        const formatedResponse = {
            success: true,
            message: `Clausula atualizado(a) com sucesso`,
            data: {
                ...updatedClause
            },
            count: 1,
            type: "Clause"
        }

        return formatedResponse
    }
}

export { UpdateClauseUseCase }

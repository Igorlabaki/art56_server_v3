
import { DeleteClauseRequestParamSchema } from "../../../zod/clause/delete-clause-param-schema"
import { ClauseRepositoryInterface } from "../../../repositories/interface/clause-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class DeleteClauseUseCase {
    constructor(private clauseRepository: ClauseRepositoryInterface) { }

    async execute({ clauseId }: DeleteClauseRequestParamSchema) {

        // Validate if clause exists
        const clause = await this.clauseRepository.getById(clauseId)

        if (!clause) {
            throw new HttpResourceNotFoundError("Clausula")
        }
        //

        const deletedClause = await this.clauseRepository.delete(clauseId)

        const formatedResponse = {
            success: true,
            message: `Clausula deletada com sucesso`,
            data: {
                ...deletedClause
            },
            count: 1,
            type: "Clause"
        }

        return formatedResponse
    }
}

export { DeleteClauseUseCase }


import { DeleteByIdProposalSchema } from "../../../zod/proposal/delete-proposal-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";

class DeleteProposalByIdUseCase {
    constructor(private proposalRepository: ProposalRepositoryInterface) { }

    async execute(param: DeleteByIdProposalSchema) {
        
        // Validate if proposal exists
            const proposal = await this.proposalRepository.delete(param.proposalId)

            if (!proposal) {
                throw new HttpResourceNotFoundError("Orcamento")
            }
        //

        const formatedResponse = {
            success: true,
            message: `Orcamento ${proposal.name} deletado com sucesso`,
            data: {
                ...proposal
            },
            count: 1,
            type: "Proposal"
        }



        return formatedResponse 
    }
}

export { DeleteProposalByIdUseCase }

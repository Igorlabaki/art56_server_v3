import { GetByIdProposalSchema } from "../../../zod/proposal/get-by-id-proposal-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";

class GetProposalByIdUseCase {
    constructor(private proposalRepository: ProposalRepositoryInterface) { }

    async execute(param: GetByIdProposalSchema) {
        
        // Validate if proposal exists
            const proposal = await this.proposalRepository.getById(param.proposalId)

            if (!proposal) {
                throw new HttpResourceNotFoundError("Orcamento")
            }
        //

        const formatedResponse = {
            success: true,
            message: `Orcamento de ${proposal.completeClientName} encontrado com sucesso`,
            data: {
                ...proposal
            },
            count: 1,
            type: "Proposal"
        }



        return formatedResponse 
    }
}

export { GetProposalByIdUseCase }

import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { UpdatePersonalInfoProposalSchema } from "../../../zod/proposal/update-personal-info-proposal-params-schema";

class UpdateProposalPersonalInfoUseCase {
    constructor(
        private proposalRepository: ProposalRepositoryInterface,
    ) { }

    async execute(param: UpdatePersonalInfoProposalSchema) {

        // Validate if proposal exists
        const proposal = await this.proposalRepository.getById(param.proposalId)

        if (!proposal) {
            throw new HttpResourceNotFoundError("Orcamento")
        }
        //

        const updatedProposal = await this.proposalRepository.updatePersonalInfo(param);

        if (!updatedProposal) {
            throw Error("Erro na conexao com o banco de dados")
        }

        const formatedResponse = {
            success: true,
            message: `Orcamento atualizado com sucesso`,
            data:{
                ...updatedProposal
            },
            count: 1,
            type: "Proposal"
        }

        return formatedResponse 
    }
}

export { UpdateProposalPersonalInfoUseCase }

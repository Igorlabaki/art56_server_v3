
import { DeleteContractRequestParamSchema } from "../../../zod/contract/delete-contract-param-schema"
import { ContractRepositoryInterface } from "../../../repositories/interface/contract-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class DeleteContractUseCase {
    constructor(private contractRepository: ContractRepositoryInterface) { }

    async execute({ contractId }: DeleteContractRequestParamSchema) {

        // Validate if contract exists
        const contract = await this.contractRepository.getById(contractId)

        if (!contract) {
            throw new HttpResourceNotFoundError("Contrato")
        }
        //

        const deletedContract = await this.contractRepository.delete(contractId)

        const formatedResponse = {
            success: true,
            message: `Contrato deletado com sucesso`,
            data: {
                ...deletedContract
            },
            count: 1,
            type: "Contract"
        }

        return formatedResponse
    }
}

export { DeleteContractUseCase }

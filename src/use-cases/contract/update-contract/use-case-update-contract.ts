import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UpdateContractRequestParams } from "../../../zod/contract/update-contract-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ContractRepositoryInterface } from "../../../repositories/interface/contract-repository-interface";

class UpdateContractUseCase {
    constructor(private contractRepository: ContractRepositoryInterface) { }

    async execute(param: UpdateContractRequestParams) {
      
        // Validate if contract exists
        const contract = await this.contractRepository.getById(param.contractId)

        if (!contract) {
            throw new HttpResourceNotFoundError("Contrato")
        }
        //

        const updatedContract = await this.contractRepository.update(param)

        if (!updatedContract) {
            throw new HttpConflictError("Contrato")
        }

        const formatedResponse = {
            success: true,
            message: `Contrato atualizado(a) com sucesso`,
            data: {
                ...updatedContract
            },
            count: 1,
            type: "Contract"
        }

        return formatedResponse
    }
}

export { UpdateContractUseCase }

import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { GetContractByIdRequestParamSchema } from "../../../zod/contract/get-by-id-contract-param-schema";
import { ContractRepositoryInterface } from "../../../repositories/interface/contract-repository-interface";


class GetContractByIdUseCase {
    constructor(private contractRepository: ContractRepositoryInterface) { }

    async execute({contractId}: GetContractByIdRequestParamSchema) {

        // Validate if contract exists
        const contract = await this.contractRepository.getById(contractId)

        if (!contract) {
            throw new HttpResourceNotFoundError("Contrato")
        }
        //

        const formatedResponse = {
            success: true,
            message: `Contrato  ${contract.title}`,
            data: {
                contract
            },
            count: 1,
            type: "Locacao"
        }

        return formatedResponse
    }
}

export { GetContractByIdUseCase }

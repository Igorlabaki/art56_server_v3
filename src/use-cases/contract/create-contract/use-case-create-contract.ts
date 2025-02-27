import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { ContractRepositoryInterface } from "../../../repositories/interface/contract-repository-interface";
import { CreateContractRequestParams } from "../../../zod/contract/create-contract-params-schema";

class CreateContractUseCase {
  constructor(private contractRepository: ContractRepositoryInterface) {}

  async execute(params: CreateContractRequestParams) {
    const newContract = await this.contractRepository.create(params);

    const formatedResponse = {
      success: true,
      message: "Contrato foi cadastrado com sucesso",
      data: {
         ...newContract
      },
      count: 1,
      type: "Contract"
  } 

  return formatedResponse
  }
}

export { CreateContractUseCase };

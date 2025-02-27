import { ListContractRequestQuerySchema } from "../../../zod/contract/list-contract-query-schema";
import { ContractRepositoryInterface } from "../../../repositories/interface/contract-repository-interface";

class ListContractsUseCase {
  constructor(private contractRepository: ContractRepositoryInterface) { }

  async execute(query: ListContractRequestQuerySchema) {
    const contractList = await this.contractRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de contratos com ${contractList?.length} items`,
      data: {
        contractList: contractList
      },
      count: contractList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListContractsUseCase };

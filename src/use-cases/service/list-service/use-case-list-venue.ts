import { ListServiceRequestQuerySchema } from "../../../zod/services/list-service-query-schema";
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface";

class ListServicesUseCase {
  constructor(private serviceRepository: ServiceRepositoryInterface) { }

  async execute(query: ListServiceRequestQuerySchema) {
    const serviceList = await this.serviceRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de servicos com ${serviceList?.length} items`,
      data: {
        serviceList: serviceList
      },
      count: serviceList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListServicesUseCase };

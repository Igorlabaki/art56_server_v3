import { ListTextRequestQuerySchema } from "../../../zod/text/list-text-query-schema";
import { TextRepositoryInterface } from "../../../repositories/interface/text-repository-interface";
import { ListTextOrganizationRequestQuerySchema } from "../../../zod/text-organization/list-text-organizations-query-schema";

class ListTextOrganizationUseCase {
  constructor(private textRepository: TextRepositoryInterface) { }

  async execute(query: ListTextOrganizationRequestQuerySchema) {
    const textList = await this.textRepository.listTextOrganization(query);

    const formatedResponse = {
      success: true,
      message: `Lista de textos com ${textList?.length} items`,
      data: {
        textList: textList
      },
      count: textList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListTextOrganizationUseCase };

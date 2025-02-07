import { ListTextRequestQuerySchema } from "../../../zod/text/list-text-query-schema";
import { TextRepositoryInterface } from "../../../repositories/interface/text-repository-interface";

class ListTextsUseCase {
  constructor(private textRepository: TextRepositoryInterface) { }

  async execute(query: ListTextRequestQuerySchema) {
    const textList = await this.textRepository.list(query);

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

export { ListTextsUseCase };

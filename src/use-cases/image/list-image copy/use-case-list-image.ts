
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";
import { ListImageRequestQuerySchema } from "../../../zod/image/list-image-query-schema";

class ListImagesUseCase {
  constructor(private imageRepository: ImageRepositoryInterface) { }

  async execute(query: ListImageRequestQuerySchema) {
    const imageList = await this.imageRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de imagens com ${imageList?.length} items`,
      data: {
        imageList: imageList
      },
      count: imageList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListImagesUseCase };

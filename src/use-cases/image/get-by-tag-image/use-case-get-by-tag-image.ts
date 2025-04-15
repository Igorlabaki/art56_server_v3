
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";
import { GetByTagImageRequestQuerySchema } from "../../../zod/image/get-by-tag-image-query-schema";

class GetByTagImagesUseCase {
  constructor(private imageRepository: ImageRepositoryInterface) { }

  async execute(query: GetByTagImageRequestQuerySchema) {
    const imagesByTag = await this.imageRepository.getByTag(query);

    const formatedResponse = {
      success: true,
      message: `Lista de imagens com ${imagesByTag?.length} items`,
      data: {
        imagesByTag: imagesByTag
      },
      count: imagesByTag?.length,
      type: "GetByTag"
    }

    return formatedResponse;
  }
}

export { GetByTagImagesUseCase };

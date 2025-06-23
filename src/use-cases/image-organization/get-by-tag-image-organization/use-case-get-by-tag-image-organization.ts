
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";
import { GetByTagImageOrganizationRequestQuerySchema } from "../../../zod/image-organization/get-by-tag-image-organization-query-schema";
import { GetByTagImageRequestQuerySchema } from "../../../zod/image/get-by-tag-image-query-schema";

class GetByTagImagesOrganizationUseCase {
  constructor(private imageRepository: ImageRepositoryInterface) { }

  async execute(query: GetByTagImageOrganizationRequestQuerySchema) {
    const imagesByTag = await this.imageRepository.getByTagOrganization(query);

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

export { GetByTagImagesOrganizationUseCase };

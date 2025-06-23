
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";
import { ListImageOrganizationRequestQuerySchema } from "../../../zod/image-organization/list-image-organization-query-schema";
import { ListImageRequestQuerySchema } from "../../../zod/image/list-image-query-schema";

class ListImagesOrganizationUseCase {
  constructor(private imageRepository: ImageRepositoryInterface) { }

  async execute(query: ListImageOrganizationRequestQuerySchema) {
    const imageList = await this.imageRepository.listOrganization(query);

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

export { ListImagesOrganizationUseCase };

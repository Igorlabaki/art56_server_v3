import { CreateImageDbParams } from "../../../zod/image/create-image-params-db-schema";
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";
import { CreateImageOrganizationDbParams } from "../../../zod/image-organization/create-image-organization-params-db-schema";

class CreateImageOrganizationUseCase {
  constructor(private imageRepository: ImageRepositoryInterface) {}

  async execute(params : CreateImageOrganizationDbParams) {
    const newImage = await this.imageRepository.createOrganization(params);

    const formatedResponse = {
      success: true,
      message: "Imagem foi cadastrada com sucesso",
      data: {
         ...newImage
      },
      count: 1,
      type: "Image"
  } 

  return formatedResponse
  }
}

export { CreateImageOrganizationUseCase };

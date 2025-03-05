import { CreateImageDbParams } from "../../../zod/image/create-image-params-db-schema";
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";

class CreateImageUseCase {
  constructor(private imageRepository: ImageRepositoryInterface) {}

  async execute(params : CreateImageDbParams) {
    const newImage = await this.imageRepository.create(params);

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

export { CreateImageUseCase };

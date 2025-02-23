import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { CreateImageRequestParams } from "../../../zod/image/create-image-params-schema";
import { ImageRepositoryInterface } from "../../../repositories/interface/image-repository-interface";

class CreateImageUseCase {
  constructor(private imageRepository: ImageRepositoryInterface) {}

  async execute(params : CreateImageRequestParams) {
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

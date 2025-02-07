import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { TextRepositoryInterface } from "../../../repositories/interface/text-repository-interface";
import { CreateTextRequestParams } from "../../../zod/text/create-text-params-schema";

class CreateTextUseCase {
  constructor(private textRepository: TextRepositoryInterface) {}

  async execute({area,position,text,title,venueId}: CreateTextRequestParams) {

    if(title){
      const validateIfExistTextAreaTitle = await this.textRepository.validateIfExistTextAreaTitle({area, title});

      if (validateIfExistTextAreaTitle && title != undefined) {
        throw new HttpConflictError("Texto com esse mesmo titulo")
      }
    }
    
    const validateIfExistTextAreaPosition = await this.textRepository.validateIfExistTextAreaPosition({area, position});

    if (validateIfExistTextAreaPosition) {
      throw new HttpConflictError("Texto nesta area com esta posicao")
    }

    const newText = await this.textRepository.create({area,position,text,title,venueId});

    const formatedResponse = {
      success: true,
      message: "Texto foi criada com sucesso",
      data: {
         ...newText
      },
      count: 1,
      type: "Text"
  } 

  return formatedResponse
  }
}

export { CreateTextUseCase };

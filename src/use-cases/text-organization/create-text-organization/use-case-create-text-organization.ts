import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { TextRepositoryInterface } from "../../../repositories/interface/text-repository-interface";
import { CreateTextOrganizationSchema } from "../../../zod/text-organization/create-text-organization-params-schema";


class CreateTextOrganizationUseCase {
  constructor(private textRepository: TextRepositoryInterface) {}

  async execute({area,position,text,title,organizationId}: CreateTextOrganizationSchema) {

    if(title){
      const validateIfExistTextAreaTitle = await this.textRepository.validateIfExistTextAreaTitle({area, title, organizationId});

      if (validateIfExistTextAreaTitle && title != undefined) {
        throw new HttpConflictError("Texto com esse mesmo titulo")
      }
    }
    
    const validateIfExistTextAreaPosition = await this.textRepository.validateIfExistTextAreaPosition({area, position, organizationId});

    if (validateIfExistTextAreaPosition) {
      throw new HttpConflictError("Texto nesta area com esta posicao")
    }

    const newTextOrganization = await this.textRepository.createTextOrganization({area,position,text,title,organizationId});

    const formatedResponse = {
      success: true,
      message: "Texto foi criada com sucesso",
      data: {
         ...newTextOrganization
      },
      count: 1,
      type: "Text"
  } 

  return formatedResponse
  }
}

export { CreateTextOrganizationUseCase };

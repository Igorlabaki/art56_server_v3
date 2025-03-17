import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface";
import { CreateUserOrganizationRequestParams } from "../../../zod/user-organization/create-user-organization-params-schema";


class CreateUserOrganizationUseCase {
  constructor(private userorganizationRepository: UserOrganizationRepositoryInterface) {}

  async execute(params : CreateUserOrganizationRequestParams) {

    const userOrganizationList = await this.userorganizationRepository.create(params);

    const formatedResponse = {
      success: true,
      message: `Usuario foi cadastrado na organizacao com sucesso.`,
      data: {
        userOrganizationList: userOrganizationList
      },
      count: 1,
      type: "UserOrganization"
  } 

  return formatedResponse
  }
}

export { CreateUserOrganizationUseCase };

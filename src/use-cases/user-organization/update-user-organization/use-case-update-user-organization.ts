import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface";
import { UpdateUserOrganizationRequestParams } from "../../../zod/user-organization/update-user-organization-params-schema";


class UpdateUserOrganizationUseCase {
  constructor(private userorganizationRepository: UserOrganizationRepositoryInterface) {}

  async execute(params : UpdateUserOrganizationRequestParams) {

    const updateUserOrganization = await this.userorganizationRepository.update(params);

    const formatedResponse = {
      success: true,
      message: `Usuario foi atualizado na organizacao com sucesso.`,
      data: {
        ...updateUserOrganization
      },
      count: 1,
      type: "UserOrganization"
  } 

  return formatedResponse
  }
}

export { UpdateUserOrganizationUseCase };

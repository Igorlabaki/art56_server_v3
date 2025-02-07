import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";

import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { ListOrganizationQuerySchema } from "../../../zod/organization/list-organization-params-schema";
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface";

class ListOrganizationUseCase {
  constructor(private organizationRepository: OrganizationRepositoryInterface, private userRepository: UserRepositoryInterface) { }

  async execute(params: ListOrganizationQuerySchema) {

    const userById = await this.userRepository.getById(params.userId)

    if(!userById){
      throw new HttpResourceNotFoundError("Usuario")
    }

    const organizationList = await this.organizationRepository.list(params);

    const formatedResponse = {
      success: true,
      message: `Lista de organizacoes com ${organizationList?.length} items`,
      data: {
        organizationList: organizationList
      },
      count: organizationList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListOrganizationUseCase };

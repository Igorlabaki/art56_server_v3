

import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface";
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface";
import { ListUserOrganizationRequestQuerySchema } from "../../../zod/user-organization/list-user-organization-query-schema";

class ListUserOrganizationUseCase {
  constructor(private userOrganizationRepository: UserOrganizationRepositoryInterface, private organizationRepository: OrganizationRepositoryInterface) { }

  async execute({organizationId,username}: ListUserOrganizationRequestQuerySchema) {

    const userById = await this.organizationRepository.getById({organizationId})

    if(!userById){
      throw new HttpResourceNotFoundError("Organizacao")
    }

    const userOrganizationList = await this.userOrganizationRepository.list({organizationId,username});

    const formatedResponse = {
      success: true,
      message: `Lista de organizacoes com ${userOrganizationList?.length} items`,
      data: {
        userOrganizationList: userOrganizationList
      },
      count: userOrganizationList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListUserOrganizationUseCase };

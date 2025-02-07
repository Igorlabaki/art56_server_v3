
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { ListUserOrganizationRequestQuerySchema } from "../../../zod/user-organization/list-user-organization-query-schema";

class ListUserOrganizationUseCase {
  constructor(private userOrganizationRepository: UserOrganizationRepositoryInterface, private userRepository: UserRepositoryInterface) { }

  async execute({userId}: ListUserOrganizationRequestQuerySchema) {

    const userById = await this.userRepository.getById(userId)

    if(!userById){
      throw new HttpResourceNotFoundError("Usuario")
    }

    const userOrganizationList = await this.userOrganizationRepository.list(userId);

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

import { ListOwnerQuerySchema } from "../../../zod/owner/list-owner-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface";
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface";

class ListOwnerUseCase {
  constructor(private ownerRepository: OwnerRepositoryInterface, private organizationRepository: OrganizationRepositoryInterface) { }

  async execute(params: ListOwnerQuerySchema) {

    const userById = await this.organizationRepository.getById({organizationId:params.organizationId})

    if(!userById){
      throw new HttpResourceNotFoundError("Organizacao")
    }

    const ownerList = await this.ownerRepository.list(params);

    const formatedResponse = {
      success: true,
      message: `Lista de proprietarios com ${ownerList?.length} items`,
      data: {
        ownerByOrganizationList: ownerList
      },
      count: ownerList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListOwnerUseCase };

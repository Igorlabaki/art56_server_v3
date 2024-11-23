import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { SessionRepositoryInterface } from "../../../repositories/interface/session-repository-interface"
import { CreateOrganizationRequestParams } from "../../../zod/organization/create-organization-params-schema"
import { RefreshTokenRepositoryInterface } from "../../../repositories/interface/refresh-token-repository-interface"
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface"
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"

class CreateOrganizationUseCase {
    constructor(
        private organizationRepository: OrganizationRepositoryInterface,
        private userOrganizationRepository: UserOrganizationRepositoryInterface,
    ) { }

    async execute({ name, userId }: CreateOrganizationRequestParams) {

        // Validate if user exists
        const organizationAlreadyExists = await this.organizationRepository.create({
            name,
            userId
        })

        if (!organizationAlreadyExists) {
            throw new HttpConflictError("Organization")
        }
        //

        return { organizationAlreadyExists  }
    }
}

export { CreateOrganizationUseCase }
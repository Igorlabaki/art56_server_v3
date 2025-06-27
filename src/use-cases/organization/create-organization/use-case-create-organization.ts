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
        private userRepositoryInterface: UserRepositoryInterface,
    ) { }

    async execute({ name, userId, ...rest }: CreateOrganizationRequestParams) {

        const userByid = await this.userRepositoryInterface.getById(
            userId
        )

        if (!userByid) {
            throw new HttpResourceNotFoundError("Usuario")
        }

        // Validate if user exists
        const newOrganization = await this.organizationRepository.create({
            name,
            userId,
            ...rest
        })

        if (!newOrganization) {
            throw new HttpConflictError("Organizacao")
        }
        //

        const formatedResponse = {
            success: true,
            message: `Organizacao ${newOrganization.name} criada com sucesso`,
            data: newOrganization,
            count: 1,
            type: "Organization"
        }

        return formatedResponse
    }
}

export { CreateOrganizationUseCase }
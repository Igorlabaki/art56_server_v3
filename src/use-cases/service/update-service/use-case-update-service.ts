import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { UpdateServiceRequestParams } from "../../../zod/services/update-service-params-schema"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface"
import { ServiceAuthorizer } from "../service-authorizer"

class UpdateServiceUseCase {
    constructor(
        private serviceRepository: ServiceRepositoryInterface,
        private authorizer: ServiceAuthorizer,
        private deleteImage: (imageUrl: string | null | undefined) => Promise<void> = async () => undefined,
    ) { }

    async execute(userId: string | undefined, param: UpdateServiceRequestParams) {
        const service = await this.serviceRepository.getById(param.serviceId)

        if (!service) {
            throw new HttpResourceNotFoundError("Servico")
        }

        await this.authorizer.assert(userId, service.venueId)

        if (param.data.name && param.data.name !== service.name) {
            const sameName = await this.serviceRepository.getByName({ name: param.data.name, venueId: service.venueId })
            if (sameName && sameName.id !== service.id) {
                throw new HttpConflictError("Servico")
            }
        }

        const { removeImage, imageUrl, ...rest } = param.data
        const data = {
            ...rest,
            ...(removeImage ? { imageUrl: null } : {}),
            ...(imageUrl ? { imageUrl } : {}),
        }

        const updatedService = await this.serviceRepository.update({
            serviceId: param.serviceId,
            data,
        })

        if (!updatedService) {
            throw new HttpConflictError("Servico")
        }

        if ((removeImage || imageUrl) && service.imageUrl && service.imageUrl !== imageUrl) {
            await this.deleteImage(service.imageUrl)
        }

        return {
            success: true,
            message: `Servico atualizado(a) com sucesso`,
            data: {
                ...updatedService
            },
            count: 1,
            type: "Service"
        }
    }
}

export { UpdateServiceUseCase }

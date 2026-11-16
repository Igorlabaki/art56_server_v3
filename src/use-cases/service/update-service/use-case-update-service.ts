import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { assertPhotoBelongsToVenue, VenuePhotoRef } from "../../../functions/venue-photo-ref"
import { UpdateServiceRequestParams } from "../../../zod/services/update-service-params-schema"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface"
import { ServiceAuthorizer } from "../service-authorizer"

class UpdateServiceUseCase {
    constructor(
        private serviceRepository: ServiceRepositoryInterface,
        private authorizer: ServiceAuthorizer,
        private deleteImage: (imageUrl: string | null | undefined) => Promise<void> = async () => undefined,
        private photos?: { getById: (id: string) => Promise<VenuePhotoRef | null> },
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

        const { removeImage, imageUrl, photoId, ...rest } = param.data
        let nextImageUrl = imageUrl
        let nextPhotoId = photoId
        if (photoId) {
            const photo = assertPhotoBelongsToVenue(await this.photos?.getById(photoId), service.venueId)
            nextImageUrl = photo.url
            nextPhotoId = photo.id
        }
        const data = {
            ...rest,
            ...(nextPhotoId ? { photoId: nextPhotoId } : {}),
            ...(removeImage ? { imageUrl: null, photoId: null } : {}),
            ...(nextImageUrl ? { imageUrl: nextImageUrl } : {}),
        }

        const updatedService = await this.serviceRepository.update({
            serviceId: param.serviceId,
            data,
        })

        if (!updatedService) {
            throw new HttpConflictError("Servico")
        }

        if (!photoId && (removeImage || imageUrl) && service.imageUrl && service.imageUrl !== imageUrl) {
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

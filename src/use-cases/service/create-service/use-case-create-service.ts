import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { assertPhotoBelongsToVenue, VenuePhotoRef } from "../../../functions/venue-photo-ref"
import { CreateServiceRequestParams } from "../../../zod/services/create-service-params-schema"
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface"
import { ServiceAuthorizer } from "../service-authorizer"

class CreateServiceUseCase {
    constructor(
        private serviceRepository: ServiceRepositoryInterface,
        private authorizer: ServiceAuthorizer,
        private photos?: { getById: (id: string) => Promise<VenuePhotoRef | null> },
    ) { }

    async execute(userId: string | undefined, params: CreateServiceRequestParams) {
        await this.authorizer.assert(userId, params.venueId)

        if (params.photoId) {
            const photo = assertPhotoBelongsToVenue(await this.photos?.getById(params.photoId), params.venueId)
            params = { ...params, photoId: photo.id, imageUrl: photo.url }
        }

        const serviceAlreadyExists = await this.serviceRepository.getByName({ name: params.name, venueId: params.venueId })

        if (serviceAlreadyExists) {
            throw new HttpConflictError("Servico")
        }

        const newService = await this.serviceRepository.create(params)

        if (!newService) {
            throw new HttpConflictError("Servico")
        }

        return {
            success: true,
            message: "Servico foi registrado com sucesso",
            data: {
                ...newService
            },
            count: 1,
            type: "Service"
        }
    }
}

export { CreateServiceUseCase }

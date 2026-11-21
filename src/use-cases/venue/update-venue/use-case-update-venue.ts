import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { omitLegacyVenueLinkColumns, syncContactVenueLinks } from "../../../functions/venue-link"
import { VenueLinkRepository } from "../../../repositories/interface/venue-link-repository-interface"
import { UpdateVenueSchemaDb } from "../../../zod/venue/update-venue-params-schema"

class UpdateVenueUseCase {
    constructor(
        private venueRepository: VenueRepositoryInterface,
        private links: VenueLinkRepository,
    ) { }

    async execute(param: UpdateVenueSchemaDb) {
        // Validate if venue exists
        const venue = await this.venueRepository.getById({venueId: param.venueId})
        console.log(param, "params" )
        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }
        //

        const updatedVenue = await this.venueRepository.update({
            ...param,
            data: omitLegacyVenueLinkColumns(param.data),
        })
        console.log(updatedVenue, "updatedVenue")
        if (!updatedVenue) {
            throw new HttpConflictError("Locacao")
        }

        const formattedVenue = {
            ...updatedVenue,
            // @ts-ignore
            permissions: venue.userVenuePermissions
              .map((up: { permissions: string }) => up.permissions) // 🔥 Extrai permissões
              .join(",").split(",") // 🔥 Junta em uma única string separada por vírgula
          };
          console.log(formattedVenue, "formattedVenue")
        await this.syncContactLinks(param.venueId, param.data)
        const formatedResponse = {
            success: true,
            message: `Locacao  ${updatedVenue.name} atualizado(a) com sucesso`,
            data: {
                ...formattedVenue
            },
            count: 1,
            type: "Venue"
        }

        return formatedResponse
    }

    private async syncContactLinks(venueId: string, data: UpdateVenueSchemaDb["data"]) {
        if (data.whatsappNumber === undefined && data.tourVideoUrl === undefined) return
        const record = await this.links.findByKey(venueId)
        if (!record) return
        const change = syncContactVenueLinks(record.links, {
            whatsappNumber: data.whatsappNumber,
            tourVideoUrl: data.tourVideoUrl,
        })
        if (change.remove.length > 0) await this.links.deleteKinds(record.id, change.remove)
        if (change.insert.length > 0) await this.links.insertMissing(record.id, change.insert)
    }
}

export { UpdateVenueUseCase }

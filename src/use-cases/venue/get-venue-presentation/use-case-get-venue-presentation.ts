import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { toVenuePresentation, VenuePublicPresentationSource } from "../../../functions/to-venue-presentation";
import { VenueImagesForChoice } from "../../../repositories/interface/proposal-repository-interface";
import { VenueSiteEditPermission } from "../../../repositories/interface/venue-site-edit-permission-interface";

export interface VenuePublicPresentationReader {
    getPublicPresentation(venueId: string): Promise<VenuePublicPresentationSource | null>;
    listImageCatalog(venueKey: string): Promise<VenueImagesForChoice | null>;
}

const deny: VenueSiteEditPermission = { canEditVenueSite: async () => false };

class GetVenuePresentationUseCase {
    constructor(
        private venues: VenuePublicPresentationReader,
        private permission: VenueSiteEditPermission = deny,
    ) {}

    async execute(venueKey: string, userId: string | null = null) {
        const source = await this.venues.getPublicPresentation(venueKey);
        if (!source) {
            throw new HttpResourceNotFoundError("Espaco");
        }

        const canReorder = userId
            ? await this.permission.canEditVenueSite(userId, source.id)
            : false;
        const catalog = canReorder
            ? (await this.venues.listImageCatalog(venueKey))?.images ?? []
            : [];

        return {
            success: true as const,
            message: "Apresentacao do espaco",
            data: {
                ...toVenuePresentation(source),
                canReorder,
                catalog,
            },
            count: 1,
            type: "VenuePresentation" as const,
        };
    }
}

export { GetVenuePresentationUseCase };

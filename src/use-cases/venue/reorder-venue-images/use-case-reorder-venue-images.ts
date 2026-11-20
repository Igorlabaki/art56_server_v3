import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { planVisibleImagePositions } from "../../../functions/plan-visible-image-positions";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { VenueSiteEditPermission } from "../../../repositories/interface/venue-site-edit-permission-interface";
import { VenuePublicPresentationReader } from "../get-venue-presentation/use-case-get-venue-presentation";

class ReorderVenueImagesUseCase {
    constructor(
        private venues: VenuePublicPresentationReader,
        private images: Pick<ProposalRepositoryInterface, "applyImagePositions">,
        private permission: VenueSiteEditPermission,
    ) {}

    async execute({ venueKey, imageIds, userId }: { venueKey: string; imageIds: string[]; userId: string | null }) {
        if (!userId) {
            throw new HttpTokenError();
        }

        const catalog = await this.venues.listImageCatalog(venueKey);
        if (!catalog) {
            throw new HttpResourceNotFoundError("Espaco");
        }

        const canReorder = await this.permission.canEditVenueSite(userId, catalog.venueId);
        if (!canReorder) {
            throw new HttpForbiddenError("Voce nao pode reordenar as fotos deste espaco.");
        }

        const visible = catalog.images
            .filter((image) => image.isShowOnProposal)
            .map((image) => ({
                id: image.id,
                imageUrl: image.imageUrl,
                description: image.description,
                position: image.position,
            }));
        const hiddenPositions = catalog.images
            .filter((image) => !image.isShowOnProposal)
            .map((image) => image.position);
        const plan = planVisibleImagePositions(visible, hiddenPositions, imageIds);
        if (!plan.ok) {
            throw new HttpBadRequestError("A lista de fotos nao corresponde as fotos visiveis do espaco.");
        }

        if (plan.changed) {
            await this.images.applyImagePositions(plan.updates);
        }

        return {
            success: true,
            message: plan.changed ? "Ordem das fotos atualizada" : "Ordem das fotos ja estava salva",
            data: { images: plan.images },
            count: plan.images.length,
            type: "VenueImageOrder",
        };
    }
}

export { ReorderVenueImagesUseCase };

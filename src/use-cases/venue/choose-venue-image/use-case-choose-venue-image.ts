import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { planImageChoice } from "../../../functions/plan-image-choice";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { VenueSiteEditPermission } from "../../../repositories/interface/venue-site-edit-permission-interface";
import { VenuePublicPresentationReader } from "../get-venue-presentation/use-case-get-venue-presentation";

class ChooseVenueImageUseCase {
    constructor(
        private venues: VenuePublicPresentationReader,
        private images: Pick<ProposalRepositoryInterface, "applyImageChoice">,
        private permission: VenueSiteEditPermission,
    ) {}

    async execute({ venueKey, slotId, replacementId, userId }: { venueKey: string; slotId: string; replacementId: string; userId: string | null }) {
        if (!userId) {
            throw new HttpTokenError();
        }

        const catalog = await this.venues.listImageCatalog(venueKey);
        if (!catalog) {
            throw new HttpResourceNotFoundError("Espaco");
        }

        const canChoose = await this.permission.canEditVenueSite(userId, catalog.venueId);
        if (!canChoose) {
            throw new HttpForbiddenError("Voce nao pode trocar as fotos deste espaco.");
        }

        const plan = planImageChoice(catalog.images, slotId, replacementId);
        if (!plan.ok) {
            throw new HttpBadRequestError("A foto escolhida nao pertence ao link deste espaco.");
        }

        if (plan.changed) {
            await this.images.applyImageChoice(plan.updates);
        }

        return {
            success: true,
            message: plan.changed ? "Foto do link atualizada" : "Foto do link ja estava escolhida",
            data: { images: plan.images, catalog: plan.catalog },
            count: plan.images.length,
            type: "VenueImageChoice",
        };
    }
}

export { ChooseVenueImageUseCase };

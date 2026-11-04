import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { planImageChoice } from "../../../functions/plan-image-choice";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { VenueSiteEditPermission } from "../../../repositories/interface/venue-site-edit-permission-interface";

class ChooseProposalImageUseCase {
    constructor(
        private proposalRepository: ProposalRepositoryInterface,
        private venueSitePermission: VenueSiteEditPermission
    ) { }

    async execute({ proposalId, slotId, replacementId, userId }: { proposalId: string; slotId: string; replacementId: string; userId: string | null }) {
        if (!userId) {
            throw new HttpTokenError();
        }

        const catalog = await this.proposalRepository.listVenueImageCatalog(proposalId);
        if (!catalog) {
            throw new HttpResourceNotFoundError("Orcamento");
        }

        const canChoose = await this.venueSitePermission.canEditVenueSite(userId, catalog.venueId);
        if (!canChoose) {
            throw new HttpForbiddenError("Voce nao pode trocar as fotos deste espaco.");
        }

        const plan = planImageChoice(catalog.images, slotId, replacementId);
        if (!plan.ok) {
            throw new HttpBadRequestError("A foto escolhida nao pertence ao link deste espaco.");
        }

        if (plan.changed) {
            await this.proposalRepository.applyImageChoice(plan.updates);
        }

        return {
            success: true,
            message: plan.changed ? "Foto do link atualizada" : "Foto do link ja estava escolhida",
            data: { images: plan.images, catalog: plan.catalog },
            count: plan.images.length,
            type: "ProposalImageChoice",
        };
    }
}

export { ChooseProposalImageUseCase };

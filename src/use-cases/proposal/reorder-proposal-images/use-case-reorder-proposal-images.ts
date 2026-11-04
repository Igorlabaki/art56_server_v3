import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { planVisibleImagePositions } from "../../../functions/plan-visible-image-positions";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { VenueSiteEditPermission } from "../../../repositories/interface/venue-site-edit-permission-interface";

class ReorderProposalImagesUseCase {
    constructor(
        private proposalRepository: ProposalRepositoryInterface,
        private venueSitePermission: VenueSiteEditPermission
    ) { }

    async execute({ proposalId, imageIds, userId }: { proposalId: string; imageIds: string[]; userId: string | null }) {
        if (!userId) {
            throw new HttpTokenError();
        }

        const images = await this.proposalRepository.listVenueImagesForReorder(proposalId);
        if (!images) {
            throw new HttpResourceNotFoundError("Orcamento");
        }

        const canReorder = await this.venueSitePermission.canEditVenueSite(userId, images.venueId);
        if (!canReorder) {
            throw new HttpForbiddenError("Voce nao pode reordenar as fotos deste espaco.");
        }

        const plan = planVisibleImagePositions(images.visible, images.hiddenPositions, imageIds);
        if (!plan.ok) {
            throw new HttpBadRequestError("A lista de fotos nao corresponde as fotos visiveis do espaco.");
        }

        if (plan.changed) {
            await this.proposalRepository.applyImagePositions(plan.updates);
        }

        return {
            success: true,
            message: plan.changed ? "Ordem das fotos atualizada" : "Ordem das fotos ja estava salva",
            data: { images: plan.images },
            count: plan.images.length,
            type: "ProposalImageOrder",
        };
    }
}

export { ReorderProposalImagesUseCase };

import { GetByIdProposalSchema } from "../../../zod/proposal/get-by-id-proposal-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { VenueSiteEditPermission } from "../../../repositories/interface/venue-site-edit-permission-interface";
import { toProposalPresentation } from "../../../functions/to-proposal-presentation";

class GetProposalPresentationUseCase {
    constructor(
        private proposalRepository: ProposalRepositoryInterface,
        private venueSitePermission: VenueSiteEditPermission
    ) { }

    async execute({ proposalId, userId }: GetByIdProposalSchema & { userId: string | null }) {
        const presentation = await this.proposalRepository.getPresentation(proposalId);

        if (!presentation) {
            throw new HttpResourceNotFoundError("Orcamento");
        }

        const canReorder = userId
            ? await this.venueSitePermission.canEditVenueSite(userId, presentation.venueId)
            : false;
        const catalog = canReorder
            ? (await this.proposalRepository.listVenueImageCatalog(proposalId))?.images ?? []
            : [];

        return {
            success: true,
            message: "Apresentacao do orcamento",
            data: toProposalPresentation(presentation, canReorder, catalog),
            count: 1,
            type: "ProposalPresentation",
        };
    }
}

export { GetProposalPresentationUseCase };

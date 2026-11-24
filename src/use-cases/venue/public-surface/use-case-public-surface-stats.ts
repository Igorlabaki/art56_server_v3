import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { formRate, monthWindow, PUBLIC_SURFACE_ACTIVATED_AT } from "../../../functions/public-surface";
import { VenueLinkRepository } from "../../../repositories/interface/venue-link-repository-interface";
import { PublicSurfaceStore } from "../../../repositories/interface/public-surface-store";
import { VenueSiteViewPermission } from "../../../repositories/in-prisma/venue-site-view-permission-in-prisma";

const deny: VenueSiteViewPermission = { canViewVenueSites: async () => false };

class GetPublicSurfaceStatsUseCase {
    constructor(
        private readonly links: Pick<VenueLinkRepository, "findByKey">,
        private readonly permission: VenueSiteViewPermission = deny,
        private readonly surfaces: Pick<PublicSurfaceStore, "summarize">,
        private readonly activatedAt: Date | null = PUBLIC_SURFACE_ACTIVATED_AT,
    ) {}

    async execute(userId: string | null, venueKey: string, month: string) {
        if (!userId) throw new HttpTokenError();
        const window = monthWindow(month, this.activatedAt);
        if (!window) throw new HttpBadRequestError("Mes invalido");
        const venue = await this.links.findByKey(venueKey);
        if (!venue) throw new HttpResourceNotFoundError("Espaco");
        if (!(await this.permission.canViewVenueSites(userId, venue.id))) {
            throw new HttpForbiddenError("Sem permissao para ver o espaco");
        }
        const summary = await this.surfaces.summarize({
            venueId: venue.id,
            month: window.month,
            dayFrom: window.dayFrom,
            dayTo: window.dayTo,
            historyFrom: window.historyFrom,
            historyTo: window.historyTo,
        });
        const data = {
            month: window.month,
            dataSince: window.dataSince,
            linksOpens: summary.linksOpens,
            linksPeople: summary.linksPeople,
            clicksByKind: summary.clicksByKind,
            formOpens: summary.formOpens,
            proposalsCreated: summary.proposalsCreated,
            formRate: formRate(summary.proposalsCreated, summary.formOpens),
        };
        return {
            success: true as const,
            message: "Metricas do link tree",
            data,
            count: 1,
            type: "PublicSurfaceStats",
        };
    }
}

export { GetPublicSurfaceStatsUseCase };

import { buildServiceAdherence } from "../../../../functions/report-service-adherence";
import { ProposalRepositoryInterface } from "../../../../repositories/interface/proposal-repository-interface";
import { ReportParams } from "../../../../zod/venue/report-params-schema";
import { ReportAuthorizer } from "../report-authorizer";
import { approvedInYearWhere, reportEnvelope } from "../report-query";

class GetServiceAdherenceReportUseCase {
    constructor(
        private proposalRepository: Pick<ProposalRepositoryInterface, "serviceAdherenceRows">,
        private authorizer: Pick<ReportAuthorizer, "assert">,
    ) {}

    async execute(userId: string | undefined, params: ReportParams) {
        await this.authorizer.assert(userId, params.venueId);
        const rows = await this.proposalRepository.serviceAdherenceRows(
            approvedInYearWhere(params.venueId, params.year, params.eventCategory),
        );
        return reportEnvelope(
            buildServiceAdherence(rows, params.year, params.eventCategory ?? null),
            "ServiceAdherenceReport",
        );
    }
}

export { GetServiceAdherenceReportUseCase };

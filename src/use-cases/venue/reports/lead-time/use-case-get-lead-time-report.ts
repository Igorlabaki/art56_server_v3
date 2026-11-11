import { buildLeadTime } from "../../../../functions/report-lead-time";
import { ProposalRepositoryInterface } from "../../../../repositories/interface/proposal-repository-interface";
import { ReportParams } from "../../../../zod/venue/report-params-schema";
import { ReportAuthorizer } from "../report-authorizer";
import { leadTimeWhere, reportEnvelope } from "../report-query";

class GetLeadTimeReportUseCase {
    constructor(
        private proposalRepository: Pick<ProposalRepositoryInterface, "leadTimeRows">,
        private authorizer: Pick<ReportAuthorizer, "assert">,
    ) {}

    async execute(userId: string | undefined, params: ReportParams) {
        await this.authorizer.assert(userId, params.venueId);
        const rows = await this.proposalRepository.leadTimeRows(
            leadTimeWhere(params.venueId, params.year, params.eventCategory),
        );
        return reportEnvelope(buildLeadTime(rows, params.year, params.eventCategory ?? null), "LeadTimeReport");
    }
}

export { GetLeadTimeReportUseCase };

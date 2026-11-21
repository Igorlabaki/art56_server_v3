import { buildEventOrigin } from "../../../../functions/report-event-origin";
import { ProposalRepositoryInterface } from "../../../../repositories/interface/proposal-repository-interface";
import { ReportParams } from "../../../../zod/venue/report-params-schema";
import { ReportAuthorizer } from "../report-authorizer";
import { approvedInYearWhere, reportEnvelope } from "../report-query";

class GetEventOriginReportUseCase {
    constructor(
        private proposalRepository: Pick<ProposalRepositoryInterface, "eventOriginRows">,
        private authorizer: Pick<ReportAuthorizer, "assert">,
    ) {}

    async execute(userId: string | undefined, params: ReportParams) {
        await this.authorizer.assert(userId, params.venueId);
        const rows = await this.proposalRepository.eventOriginRows(approvedInYearWhere(params.venueId, params.year));
        return reportEnvelope(buildEventOrigin(rows, params.year), "EventOriginReport");
    }
}

export { GetEventOriginReportUseCase };

import { buildEventProfile } from "../../../../functions/report-event-profile";
import { ProposalRepositoryInterface } from "../../../../repositories/interface/proposal-repository-interface";
import { ReportParams } from "../../../../zod/venue/report-params-schema";
import { ReportAuthorizer } from "../report-authorizer";
import { approvedInYearWhere, reportEnvelope } from "../report-query";

class GetEventProfileReportUseCase {
    constructor(
        private proposalRepository: Pick<ProposalRepositoryInterface, "eventProfileRows">,
        private authorizer: Pick<ReportAuthorizer, "assert">,
    ) {}

    async execute(userId: string | undefined, params: ReportParams) {
        const venue = await this.authorizer.assert(userId, params.venueId);
        const rows = await this.proposalRepository.eventProfileRows(approvedInYearWhere(params.venueId, params.year));
        return reportEnvelope(buildEventProfile(rows, params.year, venue.maxGuest), "EventProfileReport");
    }
}

export { GetEventProfileReportUseCase };

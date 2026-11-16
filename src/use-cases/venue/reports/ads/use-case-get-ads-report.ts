import { buildAdsReport } from "../../../../functions/report-ads";
import { ExpenseRepositoryInterface } from "../../../../repositories/interface/expense-repository-interface";
import { ProposalRepositoryInterface } from "../../../../repositories/interface/proposal-repository-interface";
import { ReportParams } from "../../../../zod/venue/report-params-schema";
import { ReportAuthorizer } from "../report-authorizer";
import { leadTimeWhere, reportEnvelope } from "../report-query";

class GetAdsReportUseCase {
    constructor(
        private expenseRepository: Pick<ExpenseRepositoryInterface, "advertisingRows">,
        private proposalRepository: Pick<ProposalRepositoryInterface, "adsReportRows">,
        private authorizer: Pick<ReportAuthorizer, "assert">,
        private now: () => Date = () => new Date(),
    ) {}

    async execute(userId: string | undefined, params: ReportParams) {
        await this.authorizer.assert(userId, params.venueId);
        const [expenses, proposals] = await Promise.all([
            this.expenseRepository.advertisingRows(params.venueId),
            this.proposalRepository.adsReportRows(leadTimeWhere(params.venueId, params.year)),
        ]);
        return reportEnvelope(buildAdsReport(expenses, proposals, params.year, this.now()), "AdsReport");
    }
}

export { GetAdsReportUseCase };

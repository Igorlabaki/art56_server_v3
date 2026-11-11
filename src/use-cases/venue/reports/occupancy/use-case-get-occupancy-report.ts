import { OCCUPANCY_TYPES, buildOccupancy, occupancyPeriod } from "../../../../functions/report-occupancy";
import { DateEventRepositoryInterface } from "../../../../repositories/interface/data-event-repository-interface";
import { ReportParams } from "../../../../zod/venue/report-params-schema";
import { ReportAuthorizer } from "../report-authorizer";
import { reportEnvelope } from "../report-query";

class GetOccupancyReportUseCase {
    constructor(
        private dateEventRepository: Pick<DateEventRepositoryInterface, "occupancyRows">,
        private authorizer: Pick<ReportAuthorizer, "assert">,
    ) {}

    async execute(userId: string | undefined, params: ReportParams) {
        const venue = await this.authorizer.assert(userId, params.venueId);
        const period = occupancyPeriod(params.year, params.month);
        const rows = await this.dateEventRepository.occupancyRows({
            venueId: params.venueId,
            types: OCCUPANCY_TYPES,
            range: { gte: period.gte, lt: period.lt },
        });
        return reportEnvelope(buildOccupancy(rows, period, venue), "OccupancyReport");
    }
}

export { GetOccupancyReportUseCase };

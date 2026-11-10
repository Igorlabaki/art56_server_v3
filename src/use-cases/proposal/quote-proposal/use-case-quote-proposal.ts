import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { calcEventDuration } from "../../../functions/calc-event-duration";
import { adjustVenueUnitPrice, calcProposalAmounts } from "../../../functions/proposal-amounts";
import {
    assertChosenServiceHours,
    quoteServiceLines,
    serviceHoursMap,
    sumServiceQuote,
} from "../../../functions/quote-service-lines";
import { transformDate } from "../../../functions/transform-date";
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface";
import { QuoteProposalBody } from "../../../zod/proposal/quote-proposal-schema";
import { ProposalQuoteAuthorizer } from "../proposal-quote-authorizer";

export const NO_QUOTE_MESSAGE = "Este espaço não calcula o orçamento sozinho. Informe o Total.";

export type ProposalQuote = {
    basePrice: number;
    extraHoursQty: number;
    extraHourPrice: number;
    totalAmountService: number;
    totalAmount: number;
    minimumApplied: boolean;
};

const BARTER_QUOTE: ProposalQuote = {
    basePrice: 0,
    extraHoursQty: 0,
    extraHourPrice: 0,
    totalAmountService: 0,
    totalAmount: 0,
    minimumApplied: false,
};

class QuoteProposalUseCase {
    constructor(
        private authorizer: Pick<ProposalQuoteAuthorizer, "assert">,
        private serviceRepository: Pick<ServiceRepositoryInterface, "listForQuote">,
        private proposalRepository: Pick<ProposalRepositoryInterface, "monthlyRevenueAnalysis">,
        private goalRepository: Pick<GoalRepositoryInterface, "findByVenueAndRevenue">,
    ) { }

    async execute(params: QuoteProposalBody & { userId?: string }) {
        const venue = await this.authorizer.assert(params.userId, params.venueId);

        if (params.type === "BARTER") {
            return this.respond(BARTER_QUOTE);
        }

        const { startDate, endDate } = transformDate({
            date: params.date,
            startHour: params.startHour,
            endHour: params.endHour,
        });

        const services = await this.serviceRepository.listForQuote(venue.id, params.serviceIds);
        const hoursByServiceId = serviceHoursMap(params.serviceHours);
        assertChosenServiceHours(params.serviceIds, services, hoursByServiceId, calcEventDuration(startDate, endDate));
        const totalAmountService = sumServiceQuote(quoteServiceLines({
            venueId: venue.id,
            serviceIds: params.serviceIds,
            services,
            guestNumber: params.guestNumber,
            startDate,
            endDate,
            hoursByServiceId,
        }));

        if (venue.pricingModel !== "PER_PERSON" && venue.pricingModel !== "PER_PERSON_HOUR") {
            throw new HttpBadRequestError(NO_QUOTE_MESSAGE);
        }

        const adjusted = await adjustVenueUnitPrice(venue, startDate, {
            proposalRepository: this.proposalRepository,
            goalRepository: this.goalRepository,
        });
        const amounts = adjusted && calcProposalAmounts({
            venue,
            unitPrice: adjusted.unitPrice,
            hasMonthlyRevenue: adjusted.hasMonthlyRevenue,
            startDate,
            endDate,
            guestNumber: params.guestNumber,
            services: totalAmountService,
        });
        if (!amounts) {
            throw new HttpBadRequestError(NO_QUOTE_MESSAGE);
        }

        return this.respond({ ...amounts, totalAmountService });
    }

    private respond(data: ProposalQuote) {
        return {
            success: true,
            message: "Cotação calculada",
            data,
        };
    }
}

export { QuoteProposalUseCase };

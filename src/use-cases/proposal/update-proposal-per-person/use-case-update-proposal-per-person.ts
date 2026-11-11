import { transformDate } from "../../../functions/transform-date";
import { calcCustomTotalAmount } from "../../../functions/calc-custom-total-amount";
import { adjustVenueUnitPrice, calcProposalAmounts } from "../../../functions/proposal-amounts";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { UpdateProposalInDbParam } from "../../../zod/proposal/update-proposal-in-db-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { HistoryRepositoryInterface } from "../../../repositories/interface/history-repository-interface";
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface";
import { UpdateProposalPerPersonRequestParams } from "../../../zod/proposal/update-proposal-per-person-params-schema";
import { calcEventDuration } from "../../../functions/calc-event-duration";
import { resolveEventCategory } from "../../../functions/event-category";
import { assertChosenServiceHours, quoteServiceLines, serviceCourtesyMap, serviceHoursMap, sumServiceQuote } from "../../../functions/quote-service-lines";
import { assertCourtesyAllowed, assertDiscountAllowed, CourtesyAuthorizer } from "../proposal-quote-authorizer";
import { applyProposalDiscount, discountPercentValue, NO_DISCOUNT } from "../../../functions/proposal-discount";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { NO_QUOTE_MESSAGE } from "../quote-proposal/use-case-quote-proposal";
class UpdateProposalPerPersonUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private venueRepository: VenueRepositoryInterface,
        private serviceRepository: ServiceRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
        private goalRepository: GoalRepositoryInterface,
        private courtesyAuthorizer?: CourtesyAuthorizer,
    ) { }

    async execute(param: UpdateProposalPerPersonRequestParams, authUserId: string | null = null) {

        // Validate if proposal exists
        const proposal = await this.proposalRepository.getById(param.proposalId)

        if (!proposal) {
            throw new HttpResourceNotFoundError("Orcamento")
        }
        //

        const { date, endHour, startHour, totalAmountInput, serviceIds, serviceHours, serviceCourtesy, guestNumber, venueId, userId, eventCategory, discountPercent, ...fields } = param.data
        const rest = { ...fields, eventCategory: resolveEventCategory(param.data.type, eventCategory) }

        const courtesyByServiceId = serviceCourtesyMap(serviceCourtesy)
        await assertCourtesyAllowed(this.courtesyAuthorizer, authUserId, proposal.venueId, courtesyByServiceId)
        const percent = param.data.type === "BARTER" ? 0 : discountPercentValue(discountPercent)
        await assertDiscountAllowed(this.courtesyAuthorizer, authUserId, proposal.venueId, percent)

        const venue = await this.venueRepository.getById({ venueId: param.data.venueId })

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }

        const quotedDates = transformDate({ date, endHour, startHour, divisor: "/" })
        const quotedServices = await this.serviceRepository.listForQuote(param.data.venueId, serviceIds)
        const hoursByServiceId = serviceHoursMap(serviceHours)
        assertChosenServiceHours(serviceIds, quotedServices, hoursByServiceId, calcEventDuration(quotedDates.startDate, quotedDates.endDate))
        const serviceLines = quoteServiceLines({
            venueId: param.data.venueId,
            serviceIds,
            services: quotedServices,
            guestNumber: Number(guestNumber),
            startDate: quotedDates.startDate,
            endDate: quotedDates.endDate,
            hoursByServiceId,
            courtesyByServiceId,
        })
        const totalAmountService = sumServiceQuote(serviceLines)
        const withLines = (update: UpdateProposalInDbParam): UpdateProposalInDbParam => ({
            ...update,
            data: { ...update.data, serviceLines },
        })

        let updateProposalInDbParam: UpdateProposalInDbParam;

        if (param.data.type === "BARTER") {
            const { endDate, startDate } = transformDate({ date: date, endHour: endHour, startHour: startHour, divisor: "/" })

            updateProposalInDbParam = {
                data: {
                    ...rest,
                    endDate,
                    startDate,
                    basePrice: 0,
                    totalAmount: 0,
                    ...NO_DISCOUNT,
                    extraHoursQty: 0,
                    extraHourPrice: 0,
                    guestNumber: Number(guestNumber),
                },
                proposalId: proposal.id
            }

            if (serviceIds) {
                await this.proposalRepository.updateServices({
                    proposalId: proposal.id,
                    serviceIds
                });
            }

            const updateProposal = await this.proposalRepository.update(withLines(
                updateProposalInDbParam
            ));

            if (!updateProposal) {
                throw Error("Erro na conexao com o banco de dados")
            }

            if (userId) {
                const user = await this.userRepository.getById(userId)

                if (!user) {
                    throw new HttpResourceNotFoundError("Usuario")
                }

                await this.historyRepository.create({
                    userId: user.id,
                    proposalId: updateProposal.id,
                    action: `${user.username} atualizou este orcamento`,
                });
            }

            const formatedResponse = {
                success: true,
                message: `Orcamento criado com sucesso`,
                data: {
                    ...updateProposal
                },
                count: 1,
                type: "Proposal"
            }

            return formatedResponse
        }

        const hasCatalogPrice =
            (venue.pricingModel === "PER_PERSON" && venue.pricePerPerson) ||
            (venue.pricingModel === "PER_PERSON_HOUR" && venue.pricePerPersonHour);

        if (percent > 0 && !hasCatalogPrice) throw new HttpBadRequestError(NO_QUOTE_MESSAGE);

        if ((percent > 0 || Number(totalAmountInput) === proposal.totalAmount) && hasCatalogPrice) {

            const { endDate, startDate } = transformDate({
                date,
                endHour,
                startHour,
            });

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
                guestNumber: Number(guestNumber),
                services: totalAmountService || 0,
            });
            if (!amounts) throw Error("Erro ao calcular o orcamento");

            updateProposalInDbParam = {
                data: {
                    ...rest,
                    endDate,
                    startDate,
                    basePrice: amounts.basePrice,
                    ...applyProposalDiscount(amounts.totalAmount, percent),
                    extraHoursQty: amounts.extraHoursQty,
                    extraHourPrice: amounts.extraHourPrice,
                    serviceIds,
                    guestNumber: Number(guestNumber)
                },
                proposalId: proposal.id
            }

            if (serviceIds) {
                await this.proposalRepository.updateServices({
                    proposalId: proposal.id,
                    serviceIds
                });
            }

            const updatedProposal = await this.proposalRepository.update(withLines(
                updateProposalInDbParam
            ));

            if (!updatedProposal) {
                throw Error("Erro na conexao com o banco de dados")
            }

            if (userId) {
                const user = await this.userRepository.getById(userId)

                if (!user) {
                    throw new HttpResourceNotFoundError("Usuario")
                }

                await this.historyRepository.create({
                    userId: user.id,
                    proposalId: updatedProposal.id,
                    action: `${user.username} atualizou este orcamento`,
                });
            }

            const formatedResponse = {
                success: true,
                message: `Orcamento attuaizado com sucesso`,
                data: {
                    ...updatedProposal
                },
                count: 1,
                type: "Proposal"
            }

            return formatedResponse
        }

        const {
            basePrice,
            endDate,
            extraHourPrice,
            extraHoursQty,
            startDate,
            totalAmount
        } = calcCustomTotalAmount({
            data: {
                date,
                endHour,
                startHour,
                perPersonPrice: 100,
                guests: Number(guestNumber),
                totalAmountInput: Number(totalAmountInput),
                totalAmountService: totalAmountService || 0,
                standardEventDuration: Number(venue.standardEventDuration),
            },
            divisor: "/",
        });

        updateProposalInDbParam = {
            data: {
                ...rest,
                endDate,
                startDate,
                basePrice,
                totalAmount,
                ...NO_DISCOUNT,
                extraHoursQty,
                serviceIds,
                extraHourPrice,
                guestNumber: Number(guestNumber),
            },
            proposalId: proposal.id
        }

        if (serviceIds) {
            await this.proposalRepository.updateServices({
                proposalId: proposal.id,
                serviceIds
            });
        }

        const updatedProposal = await this.proposalRepository.update(withLines(
            updateProposalInDbParam
        ));

        if (!updatedProposal) {
            throw Error("Erro na conexao com o banco de dados")
        }

        if (userId) {
            const user = await this.userRepository.getById(userId)

            if (!user) {
                throw new HttpResourceNotFoundError("Usuario")
            }

            await this.historyRepository.create({
                userId: user.id,
                proposalId: updatedProposal.id,
                action: `${user.username} atualizou este orcamento`,
            });
        }

        const formatedResponse = {
            success: true,
            message: `Orcamento atualizado com sucesso`,
            data: {
                ...updatedProposal
            },
            count: 1,
            type: "Proposal"
        }

        return formatedResponse

    }
}

export { UpdateProposalPerPersonUseCase }

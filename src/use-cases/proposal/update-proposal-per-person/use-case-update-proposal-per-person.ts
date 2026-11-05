import { SeasonalFee, Venue } from "@prisma/client";
import { transformDate } from "../../../functions/transform-date";
import { resolveVenueMinimumPrice } from "../../../functions/resolve-minimum-price";
import { calcCustomTotalAmount } from "../../../functions/calc-custom-total-amount";
import { adjustProposalUnitPrice } from "../../../functions/adjust-proposal-unit-price";
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
import { calcExtraHourPrice } from "../../../functions/calc-extra-hour-price";
import { calcExtraHoursQty } from "../../../functions/calc-extra-hours-qty";
import { quoteServiceLines, sumServiceQuote } from "../../../functions/quote-service-lines";
class UpdateProposalPerPersonUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private venueRepository: VenueRepositoryInterface,
        private serviceRepository: ServiceRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
        private goalRepository: GoalRepositoryInterface,
    ) { }

    async execute(param: UpdateProposalPerPersonRequestParams) {

        // Validate if proposal exists
        const proposal = await this.proposalRepository.getById(param.proposalId)

        if (!proposal) {
            throw new HttpResourceNotFoundError("Orcamento")
        }
        //

        const { date, endHour, startHour, totalAmountInput, serviceIds, guestNumber, venueId, userId, ...rest } = param.data

        const venue = await this.venueRepository.getById({ venueId: param.data.venueId })

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }

        const quotedDates = transformDate({ date, endHour, startHour, divisor: "/" })
        const serviceLines = quoteServiceLines({
            venueId: param.data.venueId,
            serviceIds,
            services: await this.serviceRepository.listForQuote(param.data.venueId, serviceIds),
            guestNumber: Number(guestNumber),
            startDate: quotedDates.startDate,
            endDate: quotedDates.endDate,
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


        if (Number(totalAmountInput) === proposal.totalAmount && venue.pricingModel === "PER_PERSON" && venue.pricePerPerson) {

            const { endDate, startDate } = transformDate({
                date,
                endHour,
                startHour,
            });

            const eventDurantion = calcEventDuration(startDate, endDate);
            const venueWithFees = venue as Venue & { seasonalFee?: SeasonalFee[] };
            const { unitPrice: pricePerPerson } = await adjustProposalUnitPrice({
                unitPrice: venue.pricePerPerson,
                seasonalFee: venueWithFees.seasonalFee,
                startDate,
                venueId: venue.id,
                proposalRepository: this.proposalRepository,
                goalRepository: this.goalRepository,
            });

            const calculatedBasePrice = Number(guestNumber) * pricePerPerson;
            const extraHourPrice = calcExtraHourPrice(calculatedBasePrice);
            const extraHoursQty = venue.standardEventDuration
                ? calcExtraHoursQty(eventDurantion, venue.standardEventDuration)
                : 0;
            const totalAmount = calculatedBasePrice + (totalAmountService || 0) + extraHourPrice * extraHoursQty;

            let basePrice = calculatedBasePrice;
            let finalTotalAmount = totalAmount;
            if (resolveVenueMinimumPrice(venue, startDate) && totalAmount < resolveVenueMinimumPrice(venue, startDate)) {
                basePrice = resolveVenueMinimumPrice(venue, startDate);
                finalTotalAmount = resolveVenueMinimumPrice(venue, startDate) + (totalAmountService || 0);
            }

            updateProposalInDbParam = {
                data: {
                    ...rest,
                    endDate,
                    startDate,
                    basePrice,
                    totalAmount: finalTotalAmount,
                    extraHoursQty,
                    extraHourPrice,
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

        if (Number(totalAmountInput) === proposal.totalAmount && venue.pricingModel === "PER_PERSON_HOUR" && venue.pricePerPersonHour) {

            const { endDate, startDate } = transformDate({
                date,
                endHour,
                startHour,
            });

            const eventDurantion = calcEventDuration(startDate, endDate);
            const venueWithFees = venue as Venue & { seasonalFee?: SeasonalFee[] };
            const { unitPrice: pricePerPersonHour, hasMonthlyRevenue } = await adjustProposalUnitPrice({
                unitPrice: venue.pricePerPersonHour,
                seasonalFee: venueWithFees.seasonalFee,
                startDate,
                venueId: venue.id,
                proposalRepository: this.proposalRepository,
                goalRepository: this.goalRepository,
            });

            let calculatedBasePrice: number;
            let extraHourPrice: number;
            let extraHoursQty: number;
            let totalAmount: number;

            if (hasMonthlyRevenue) {
                calculatedBasePrice = Number(guestNumber) * pricePerPersonHour;
                extraHourPrice = calcExtraHourPrice(calculatedBasePrice);
                extraHoursQty = venue.standardEventDuration
                    ? calcExtraHoursQty(eventDurantion, venue.standardEventDuration)
                    : 0;
                totalAmount = calculatedBasePrice + (totalAmountService || 0) + extraHourPrice * extraHoursQty;
            } else {
                calculatedBasePrice = eventDurantion * (Number(guestNumber) * pricePerPersonHour);
                extraHourPrice = calculatedBasePrice / eventDurantion;
                extraHoursQty = 0;
                totalAmount = calculatedBasePrice + (totalAmountService || 0);
            }

            let basePrice = calculatedBasePrice;
            let finalTotalAmount = totalAmount;
            if (resolveVenueMinimumPrice(venue, startDate) && totalAmount < resolveVenueMinimumPrice(venue, startDate)) {
                basePrice = resolveVenueMinimumPrice(venue, startDate);
                finalTotalAmount = resolveVenueMinimumPrice(venue, startDate) + (totalAmountService || 0);
            }

            updateProposalInDbParam = {
                data: {
                    ...rest,
                    endDate,
                    startDate,
                    totalAmount: finalTotalAmount,
                    extraHourPrice,
                    extraHoursQty,
                    basePrice,
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

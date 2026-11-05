
import { SeasonalFee, Venue } from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";
import { transformDate } from "../../../functions/transform-date";
import { resolveVenueMinimumPrice } from "../../../functions/resolve-minimum-price";
import { adjustProposalUnitPrice } from "../../../functions/adjust-proposal-unit-price";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { UpdateProposalInDbParam } from "../../../zod/proposal/update-proposal-in-db-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface";
import { HistoryRepositoryInterface } from "../../../repositories/interface/history-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface";
import { UpdateProposalPerDayRequestParams } from "../../../zod/proposal/update-proposal-per-day--params-schema";
import { quoteServiceLines, sumServiceQuote } from "../../../functions/quote-service-lines";

class UpdateProposalPerDayUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private venueRepository: VenueRepositoryInterface,
        private serviceRepository: ServiceRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
        private goalRepository: GoalRepositoryInterface,
    ) { }

    async execute(param: UpdateProposalPerDayRequestParams) {

        // Validate if proposal exists
        const proposal = await this.proposalRepository.getById(param.proposalId)

        if (!proposal) {
            throw new HttpResourceNotFoundError("Orcamento")
        }
        //

        const { startDay, endDay, endHour, startHour, totalAmountInput, serviceIds,guestNumber,userId, ...rest } = param.data
        
         const { startDate } = transformDate({ date: startDay, endHour: endHour, startHour: startHour, divisor: "/" })
         const { endDate } = transformDate({ date: endDay, endHour: endHour, startHour: startHour, divisor: "/" })
         const serviceLines = quoteServiceLines({
             venueId: param.data.venueId,
             serviceIds,
             services: await this.serviceRepository.listForQuote(param.data.venueId, serviceIds),
             guestNumber: Number(guestNumber),
             startDate,
             endDate,
         })
         const totalAmountService = sumServiceQuote(serviceLines)
         const withLines = (update: UpdateProposalInDbParam): UpdateProposalInDbParam => ({
             ...update,
             data: { ...update.data, serviceLines },
         })
 
         const venue = await this.venueRepository.getById({venueId: param.data.venueId})
 
         if (!venue) {
             throw new HttpResourceNotFoundError("Locacao")
         }
 

        let updateProposalInDbParam: UpdateProposalInDbParam;

        if (param.data.type === "BARTER") {
            updateProposalInDbParam = {
                data:{
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

            if(serviceIds){
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


        if(Number(totalAmountInput) === proposal.totalAmount && venue.pricingModel === "PER_DAY" && venue.pricePerDay){

            const daysBetween = differenceInCalendarDays(endDate, startDate);
            const venueWithFees = venue as Venue & { seasonalFee?: SeasonalFee[] };
            const { unitPrice: pricePerDay } = await adjustProposalUnitPrice({
                unitPrice: venue.pricePerDay,
                seasonalFee: venueWithFees.seasonalFee,
                startDate,
                venueId: venue.id,
                proposalRepository: this.proposalRepository,
                goalRepository: this.goalRepository,
            });
            const calculatedBasePrice = daysBetween * pricePerDay;
            const totalAmount = calculatedBasePrice + (totalAmountService || 0);
            let basePrice = calculatedBasePrice;
            let finalTotalAmount = totalAmount;
            if (resolveVenueMinimumPrice(venue, startDate) && totalAmount < resolveVenueMinimumPrice(venue, startDate)) {
                basePrice = resolveVenueMinimumPrice(venue, startDate);
                finalTotalAmount = resolveVenueMinimumPrice(venue, startDate) + (totalAmountService || 0);
            }
          
            updateProposalInDbParam = {
                data:{
                    ...rest,
                    endDate,
                    startDate,
                    basePrice,
                    totalAmount: finalTotalAmount,
                    extraHoursQty: 0,
                    extraHourPrice: 0,
                    guestNumber: Number(guestNumber)
                },
                proposalId: proposal.id
            }

            if(serviceIds){
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
                message: `Orcamento atuaizado com sucesso`,
                data: {
                    ...updatedProposal
                },
                count: 1,
                type: "Proposal"
            }

            return formatedResponse
        }

        if(Number(totalAmountInput) === proposal.totalAmount && venue.pricingModel === "PER_PERSON_DAY" && venue.pricePerPersonDay){

            const daysBetween = differenceInCalendarDays(endDate, startDate);
            const venueWithFees = venue as Venue & { seasonalFee?: SeasonalFee[] };
            const { unitPrice: pricePerPersonDay } = await adjustProposalUnitPrice({
                unitPrice: venue.pricePerPersonDay,
                seasonalFee: venueWithFees.seasonalFee,
                startDate,
                venueId: venue.id,
                proposalRepository: this.proposalRepository,
                goalRepository: this.goalRepository,
            });
            const calculatedBasePrice = daysBetween * (pricePerPersonDay * Number(guestNumber));
            const totalAmount = calculatedBasePrice + (totalAmountService || 0);
            let basePrice = calculatedBasePrice;
            let finalTotalAmount = totalAmount;
            if (resolveVenueMinimumPrice(venue, startDate) && totalAmount < resolveVenueMinimumPrice(venue, startDate)) {
                basePrice = resolveVenueMinimumPrice(venue, startDate);
                finalTotalAmount = resolveVenueMinimumPrice(venue, startDate) + (totalAmountService || 0);
            }
          
            updateProposalInDbParam = {
                data:{
                    ...rest,
                    endDate,
                    startDate,
                    basePrice,
                    totalAmount: finalTotalAmount,
                    extraHoursQty: 0,
                    extraHourPrice: 0,
                    guestNumber: Number(guestNumber)
                },
                proposalId: proposal.id
            }

            if(serviceIds){
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
                message: `Orcamento atuaizado com sucesso`,
                data: {
                    ...updatedProposal
                },
                count: 1,
                type: "Proposal"
            }

            return formatedResponse
        }

        const basePrice = (Number(totalAmountInput) || 0) - (totalAmountService || 0)

        updateProposalInDbParam = {
            data:{
                ...rest,
                endDate,
                startDate,
                basePrice,
                extraHoursQty: 0,
                extraHourPrice: 0,
                guestNumber: Number(guestNumber),
                totalAmount: Number(totalAmountInput) || 0,
            },
            proposalId: proposal.id
        }

        if(serviceIds){
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
            data:{
                ...updatedProposal
            },
            count: 1,
            type: "Proposal"
        }

        return formatedResponse 
    }
}

export { UpdateProposalPerDayUseCase }

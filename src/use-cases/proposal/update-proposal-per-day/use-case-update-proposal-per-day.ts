
import { differenceInCalendarDays } from "date-fns";
import { transformDate } from "../../../functions/transform-date";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { UpdateProposalInDbParam } from "../../../zod/proposal/update-proposal-in-db-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface";
import { HistoryRepositoryInterface } from "../../../repositories/interface/history-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { UpdateProposalPerDayRequestParams } from "../../../zod/proposal/update-proposal-per-day--params-schema";

class UpdateProposalPerDayUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private venueRepository: VenueRepositoryInterface,
        private serviceRepository: ServiceRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
    ) { }

    async execute(param: UpdateProposalPerDayRequestParams) {

        // Validate if proposal exists
        const proposal = await this.proposalRepository.getById(param.proposalId)

        if (!proposal) {
            throw new HttpResourceNotFoundError("Orcamento")
        }
        //

        const { startDay, endDay, endHour, startHour, totalAmountInput, serviceIds,guestNumber,userId, ...rest } = param.data
        
        const totalAmountService = await this.serviceRepository.getByProposalServiceListTotalAmount({
             serviceIds,
             venueId: param.data.venueId,
         })
         
         const { startDate } = transformDate({ date: startDay, endHour: endHour, startHour: startHour, divisor: "/" })
         const { endDate } = transformDate({ date: endDay, endHour: endHour, startHour: startHour, divisor: "/" })
 
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

            const updateProposal = await this.proposalRepository.update(
                updateProposalInDbParam
            );

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


        if(Number(totalAmountInput) === proposal.totalAmount && venue.pricePerDay){

            const daysBetween = differenceInCalendarDays(endDate, startDate);
            const basePrice = daysBetween * venue.pricePerDay
            const totalAmount = basePrice + (totalAmountService || 0)
          
            updateProposalInDbParam = {
                data:{
                    ...rest,
                    endDate,
                    startDate,
                    basePrice,
                    totalAmount,
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

            const updatedProposal = await this.proposalRepository.update(
                updateProposalInDbParam
            );

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

        const updatedProposal = await this.proposalRepository.update(
            updateProposalInDbParam
        );

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

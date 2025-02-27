import { transformDate } from "../../../functions/transform-date";
import { calcCustomTotalAmount } from "../../../functions/calc-custom-total-amount";
import { calcStandartTotalAmount } from "../../../functions/calc-standart-total-amount";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { UpdateProposalInDbParam } from "../../../zod/proposal/update-proposal-in-db-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { HistoryRepositoryInterface } from "../../../repositories/interface/history-repository-interface";
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { UpdateProposalPerPersonRequestParams } from "../../../zod/proposal/update-proposal-per-person-params-schema";
class UpdateProposalPerPersonUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private venueRepository: VenueRepositoryInterface,
        private serviceRepository: ServiceRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
    ) { }

    async execute(param: UpdateProposalPerPersonRequestParams) {

        // Validate if proposal exists
        const proposal = await this.proposalRepository.getById(param.proposalId)

        if (!proposal) {
            throw new HttpResourceNotFoundError("Orcamento")
        }
        //

        const { date, endHour, startHour, totalAmountInput, serviceIds,guestNumber,venueId,userId, ...rest } = param.data
       
        const venue = await this.venueRepository.getById({venueId: param.data.venueId})

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }

        const totalAmountService = await this.serviceRepository.getByProposalServiceListTotalAmount({
            serviceIds,
            venueId: param.data.venueId,
        })

        let updateProposalInDbParam: UpdateProposalInDbParam;

        if (param.data.type === "BARTER") {
            const { endDate, startDate } = transformDate({ date: date, endHour: endHour, startHour: startHour, divisor: "/" })

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


        if(Number(totalAmountInput) === proposal.totalAmount && venue.pricePerPerson){

            const { basePrice, endDate, extraHourPrice, extraHoursQty, startDate, totalAmount } =
            calcStandartTotalAmount({
                data: {
                    date,
                    endHour,
                    startHour,
                    type: param.data.type,
                    guests: Number(guestNumber),
                    perPersonPrice: venue.pricePerPerson,
                    totalAmountService: totalAmountService || 0
                },
                divisor: "/",
            });
          
            updateProposalInDbParam = {
                data:{
                    ...rest,
                    endDate,
                    startDate,
                    basePrice,
                    totalAmount,
                    extraHoursQty,
                    extraHourPrice,
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
            },
            divisor: "/",
        });

        updateProposalInDbParam = {
            data:{
                ...rest,
                endDate,
                startDate,
                basePrice,
                totalAmount,
                extraHoursQty,
                extraHourPrice,
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

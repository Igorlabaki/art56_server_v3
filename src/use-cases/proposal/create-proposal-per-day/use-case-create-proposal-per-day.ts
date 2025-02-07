import { format } from "date-fns";
import { differenceInCalendarDays } from 'date-fns';
import { transformDate } from "../../../functions/transform-date";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HistoryRepositoryInterface } from "../../../repositories/interface/history-repository-interface";
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface";
import { NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";
import { CreateProposalPerDayRequestParamsSchema } from "../../../zod/proposal/create-proposal-per-day-params-schema";
import { CreateProposalInDbParams, ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";

class CreateProposalPerDayUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private venueRepository: VenueRepositoryInterface,
        private serviceRepository: ServiceRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
        private notificationRepository: NotificationRepositoryInterface,
    ) { }

    async execute(params: CreateProposalPerDayRequestParamsSchema) {

        let createProposalPerDayInDb: CreateProposalInDbParams;

        const { startDay, endDay, endHour, startHour, totalAmountInput, serviceIds, guestNumber, userId, ...rest } = params

        const totalAmountService = await this.serviceRepository.getByProposalServiceListTotalAmount({
            serviceIds,
            venueId: params.venueId,
        })

        const { startDate } = transformDate({ date: params.startDay, endHour: params.endHour, startHour: params.startHour, divisor: "/" })
        const { endDate } = transformDate({ date: params.endDay, endHour: params.endHour, startHour: params.startHour, divisor: "/" })

        const venue = await this.venueRepository.getById({ venueId: params.venueId })

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }

        if (params.type === "BARTER") {
            createProposalPerDayInDb = {
                ...rest,
                endDate,
                startDate,
                serviceIds,
                basePrice: 0,
                totalAmount: 0,
                extraHoursQty: 0,
                extraHourPrice: 0,
                guestNumber: Number(guestNumber),
            }

            const newProposal = await this.proposalRepository.createPerDay(
                createProposalPerDayInDb
            );

            if (!newProposal) {
                throw Error("Erro na conexao com o banco de dados")
            }

            await this.notificationRepository.create({
                venueId: params.venueId,
                proposalId: newProposal.id,
                content: `Novo orcamento do(a) ${newProposal.name
                    } de permuta, para data  ${format(
                        newProposal?.startDate,
                        "dd/MM/yyyy"
                    )} ate  a data ${format(
                        newProposal?.endDate,
                        "dd/MM/yyyy"
                    )}`,
                type: "PROPOSAL",
            });

            if (userId) {
                const user = await this.userRepository.getById(userId)

                if (!user) {
                    throw new HttpResourceNotFoundError("Usuario")
                }

                await this.historyRepository.create({
                    userId: user.id,
                    proposalId: newProposal.id,
                    action: `${user.username} criou este orcamento`,
                });
            }

            const formatedResponse = {
                success: true,
                message: `Orcamento criado com sucesso`,
                data: {
                    ...newProposal
                },
                count: 1,
                type: "Proposal"
            }

            return formatedResponse
        }

        if (Number(totalAmountInput) === 0 && venue.pricePerDay) {

            const daysBetween = differenceInCalendarDays(endDate, startDate);
            const basePrice = daysBetween * venue.pricePerDay
            const totalAmount = basePrice + (totalAmountService || 0)

            createProposalPerDayInDb = {
                ...rest,
                endDate,
                startDate,
                serviceIds,
                basePrice,
                totalAmount,
                extraHoursQty: 0,
                extraHourPrice: 0,
                guestNumber: Number(guestNumber),
            }

            const newProposal = await this.proposalRepository.createPerDay(
                createProposalPerDayInDb
            );

            if (!newProposal) {
                throw Error("Erro na conexao com o banco de dados")
            }

            await this.notificationRepository.create({
                venueId: params.venueId,
                proposalId: newProposal.id,
                content: `Novo orcamento do(a) ${newProposal.name
                    } no valor de ${new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(newProposal.totalAmount)}, para data  ${format(
                        newProposal?.startDate,
                        "dd/MM/yyyy"
                    )} ate  a data ${format(
                        newProposal?.endDate,
                        "dd/MM/yyyy"
                    )}`,
                type: "PROPOSAL",
            });

            if (userId) {
                const user = await this.userRepository.getById(userId)

                if (!user) {
                    throw new HttpResourceNotFoundError("Usuario")
                }

                await this.historyRepository.create({
                    userId: user.id,
                    proposalId: newProposal.id,
                    action: `${user.username} criou este orcamento`,
                });
            }

            if(!userId){
                await this.historyRepository.create({
                    proposalId: newProposal.id,
                    action: `Cliente criou este orcamento pelo site`,
                });
            }

            const formatedResponse = {
                success: true,
                message: `Orcamento criado com sucesso`,
                count: 1,
                data: {
                    ...newProposal
                },
                type: "Proposal"
            }

            return formatedResponse
        }


        const basePrice = (Number(totalAmountInput) || 0) - (totalAmountService || 0)

        createProposalPerDayInDb = {
            ...rest,
            endDate,
            startDate,
            basePrice,
            serviceIds,
            extraHoursQty: 0,
            extraHourPrice: 0,
            guestNumber: Number(guestNumber),
            totalAmount: Number(totalAmountInput) || 0,
        }

        const newProposal = await this.proposalRepository.createPerDay(
            createProposalPerDayInDb
        );

        if (!newProposal) {
            throw Error("Erro na conexao com o banco de dados")
        }

        await this.notificationRepository.create({
            venueId: params.venueId,
            proposalId: newProposal.id,
            content: `Novo orcamento do(a) ${newProposal.name
                } no valor de ${new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(newProposal.totalAmount)}, para data  ${format(
                    newProposal?.startDate,
                    "dd/MM/yyyy"
                )} ate  a data ${format(
                    newProposal?.endDate,
                    "dd/MM/yyyy"
                )}`,
            type: "PROPOSAL",
        });

        if (userId) {
            const user = await this.userRepository.getById(userId)

            if (!user) {
                throw new HttpResourceNotFoundError("Usuario")
            }

            await this.historyRepository.create({
                userId: user.id,
                proposalId: newProposal.id,
                action: `${user.username} criou este orcamento`,
            });
        }

        if(!userId){
            await this.historyRepository.create({
                proposalId: newProposal.id,
                action: `Cliente criou este orcamento pelo site`,
            });
        }

        const formatedResponse = {
            success: true,
            message: `Orcamento criado com sucesso`,
            data: {
                ...newProposal
            },
            count: 1,
            type: "Proposal"
        }

        return formatedResponse
    }
}

export { CreateProposalPerDayUseCase }
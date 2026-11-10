import { formatWallClockDateBr } from "../../../functions/wall-clock-datetime";
import { transformDate } from "../../../functions/transform-date";
import { calcCustomTotalAmount } from "../../../functions/calc-custom-total-amount";
import { calcStandartTotalAmount } from "../../../functions/calc-standart-total-amount";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface";
import { HistoryRepositoryInterface } from "../../../repositories/interface/history-repository-interface";
import { NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";
import { CreateProposalPerPersonRequestParamsSchema } from "../../../zod/proposal/create-proposal-per-person-params-schema"
import { CreateProposalInDbParams, ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface"
import { calcEventDuration } from "../../../functions/calc-event-duration";
import { resolveEventCategory } from "../../../functions/event-category";
import { calcBasePrice } from "../../../functions/calc-base-price";
import { adjustVenueUnitPrice, calcProposalAmounts } from "../../../functions/proposal-amounts";
import { assertChosenServiceHours, quoteServiceLines, serviceHoursMap, sumServiceQuote } from "../../../functions/quote-service-lines";
import { Payment, SeasonalFee, Venue } from "@prisma/client";
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface";

class CreateProposalPerPersonUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private goalRepository: GoalRepositoryInterface,
        private venueRepository: VenueRepositoryInterface,
        private serviceRepository: ServiceRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
        private notificationRepository: NotificationRepositoryInterface,
    ) { }

    async execute(params: CreateProposalPerPersonRequestParamsSchema) {
        let createProposalPerPersonInDb: CreateProposalInDbParams;
        console.log("cheguei no usecase")
        const { date, endHour, startHour, totalAmountInput, serviceIds, serviceHours, guestNumber, userId, eventCategory, ...fields } = params
        const rest = { ...fields, eventCategory: resolveEventCategory(params.type, eventCategory) }

        const quotedDates = transformDate({ date, endHour, startHour, divisor: "/" })
        const quotedServices = await this.serviceRepository.listForQuote(params.venueId, serviceIds)
        const hoursByServiceId = serviceHoursMap(serviceHours)
        assertChosenServiceHours(serviceIds, quotedServices, hoursByServiceId, calcEventDuration(quotedDates.startDate, quotedDates.endDate))
        const serviceLines = quoteServiceLines({
            venueId: params.venueId,
            serviceIds,
            services: quotedServices,
            guestNumber: Number(guestNumber),
            startDate: quotedDates.startDate,
            endDate: quotedDates.endDate,
            hoursByServiceId,
        })
        const totalAmountService = sumServiceQuote(serviceLines)
        const totalAmountInputFormated = totalAmountInput ? Number(totalAmountInput) : 0
        const venue = await this.venueRepository.getById({ venueId: params.venueId }) as Venue & { seasonalFee: SeasonalFee[] } & { Payment: Payment[] };
        console.log("venue", venue)
        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }

        if (params.type === "BARTER") {
            const { endDate, startDate } = transformDate({ date: params.date, endHour: params.endHour, startHour: params.startHour, divisor: "/" })

            createProposalPerPersonInDb = {
                ...rest,
                endDate,
                startDate,
                serviceIds,
                serviceLines,
                basePrice: 0,
                totalAmount: 0,
                extraHoursQty: 0,
                extraHourPrice: 0,
                guestNumber: Number(guestNumber),
            }

            const newProposal = await this.proposalRepository.createPerPerson(
                createProposalPerPersonInDb
            );

            if (!newProposal) {
                throw Error("Erro na conexao com o banco de dados")
            }

            const notificationContent = `Novo orcamento do(a) ${newProposal.completeClientName} de permuta, para data ${formatWallClockDateBr(newProposal.startDate)}`;

            // Criar notificação no banco
            await this.notificationRepository.create({
                venueId: params.venueId,
                proposalId: newProposal.id,
                content: notificationContent,
                type: "PROPOSAL",
            });

            if (userId) {
                const user = await this.userRepository.getById(userId)

                if (!user) {
                    throw new HttpResourceNotFoundError("Usuario")
                }

                await this.historyRepository.create({
                    userId: user.id,
                    username: user.username,
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

        const hasCatalogPrice =
            (venue.pricingModel === "PER_PERSON" && venue.pricePerPerson) ||
            (venue.pricingModel === "PER_PERSON_HOUR" && venue.pricePerPersonHour);

        if (Number(totalAmountInputFormated) === 0 && hasCatalogPrice) {
            const { endDate, startDate } = transformDate({ date, endHour, startHour });
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

            const newProposal = await this.proposalRepository.createPerPerson({
                ...rest,
                endDate,
                startDate,
                basePrice: amounts.basePrice,
                serviceIds,
                serviceLines,
                totalAmount: amounts.totalAmount,
                extraHoursQty: amounts.extraHoursQty,
                extraHourPrice: amounts.extraHourPrice,
                guestNumber: Number(guestNumber),
            });
            if (!newProposal) throw Error("Erro na conexao com o banco de dados");

            const notificationContent = `Novo orcamento de ${newProposal.completeClientName} no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(newProposal.totalAmount)}, para ${formatWallClockDateBr(newProposal.startDate)}`;

            // Envia notificação e histórico
            await this.notificationRepository.create({
                venueId: params.venueId,
                proposalId: newProposal.id,
                content: notificationContent,
                type: "PROPOSAL",
            });

            if (userId) {
                const user = await this.userRepository.getById(userId);
                if (!user) throw new HttpResourceNotFoundError("Usuário");
                await this.historyRepository.create({
                    userId: user.id,
                    username: user.username,
                    proposalId: newProposal.id,
                    action: `${user.username} criou este orçamento`,
                });
            } else {
                await this.historyRepository.create({
                    proposalId: newProposal.id,
                    action: `Cliente criou este orçamento pelo site`,
                });
            }

            return {
                success: true,
                message: "Orçamento criado com sucesso",
                data: newProposal,
                count: 1,
                type: "Proposal",
            };
        }

        if (totalAmountInput) {
            console.log("cheguei no if CUSTOM")
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

            createProposalPerPersonInDb = {
                ...rest,
                endDate,
                startDate,
                basePrice,
                serviceIds,
                serviceLines,
                totalAmount,
                extraHoursQty,
                extraHourPrice,
                guestNumber: Number(guestNumber),
            }


            const newProposal = await this.proposalRepository.createPerPerson(
                createProposalPerPersonInDb
            );


            if (!newProposal) {
                throw Error("Erro na conexao com o banco de dados")
            }

            await this.notificationRepository.create({
                venueId: params.venueId,
                proposalId: newProposal.id,
                content: `Novo orcamento do(a) ${newProposal.completeClientName
                    } no valor de ${new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    }).format(newProposal.totalAmount)}, para data  ${formatWallClockDateBr(newProposal.startDate)}`,
                type: "PROPOSAL",
            });

            if (userId) {
                const user = await this.userRepository.getById(userId)

                if (!user) {
                    throw new HttpResourceNotFoundError("Usuario")
                }

                await this.historyRepository.create({
                    userId: user.id,
                    username: user.username,
                    proposalId: newProposal.id,
                    action: `${user.username} criou este orcamento`,
                });
            }

            if (!userId) {
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

}

export { CreateProposalPerPersonUseCase }

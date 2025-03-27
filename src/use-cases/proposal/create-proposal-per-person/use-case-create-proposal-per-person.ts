import { format, isWithinInterval, parse, setYear } from "date-fns";
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
import { calcBasePrice } from "../../../functions/calc-base-price";
import { calcExtraHourPrice } from "../../../functions/calc-extra-hour-price";
import { calcExtraHoursQty } from "../../../functions/calc-extra-hours-qty";
import { SeasonalFee, Venue } from "@prisma/client";

class CreateProposalPerPersonUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private venueRepository: VenueRepositoryInterface,
        private serviceRepository: ServiceRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
        private notificationRepository: NotificationRepositoryInterface,
    ) { }

    async execute(params: CreateProposalPerPersonRequestParamsSchema) {
        let createProposalPerPersonInDb: CreateProposalInDbParams;

        const { date, endHour, startHour, totalAmountInput, serviceIds, guestNumber, userId, ...rest } = params

        const totalAmountService = await this.serviceRepository.getByProposalServiceListTotalAmount({
            serviceIds,
            venueId: params.venueId,
        })

        const venue = await this.venueRepository.getById({ venueId: params.venueId }) as Venue & { seasonalFee: SeasonalFee[] };


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

            await this.notificationRepository.create({
                venueId: params.venueId,
                proposalId: newProposal.id,
                content: `Novo orcamento do(a) ${newProposal.completeClientName
                    } de permuta, para data  ${format(
                        newProposal?.startDate,
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

        if (Number(totalAmountInput) === 0 && venue.pricePerPerson && venue.pricingModel === "PER_PERSON") {
            const { endDate, startDate } = transformDate({
                date,
                endHour,
                startHour,
            });
            const { seasonalFee } = venue
            const eventDurantion = calcEventDuration(endDate, startDate);

            let totalAdjustment = 0;
            let pricePerPerson = venue.pricePerPerson;
        
            if (seasonalFee && seasonalFee.length > 0) {
                const year = startDate.getFullYear();
                const eventDayOfWeek = format(startDate, "EEEE").toLowerCase(); // "friday"
        
                seasonalFee.forEach((fee) => {
                    const isSurcharge = fee.type === "SURCHARGE";
                    const isDiscount = fee.type === "DISCOUNT";
        
                    // Verifica se a data do evento está dentro do intervalo sazonal
                    if (fee.startDay && fee.endDay) {
                        const seasonalStart = setYear(parse(fee.startDay, "dd/MM", new Date()), year);
                        const seasonalEnd = setYear(parse(fee.endDay, "dd/MM", new Date()), year);
        
                        if (isWithinInterval(startDate, { start: seasonalStart, end: seasonalEnd })) {
                            totalAdjustment += isSurcharge ? fee.fee : -fee.fee; // Soma ou subtrai a porcentagem
                        }
                    }
        
                    // Verifica se a data do evento está dentro dos dias da semana afetados
                    if (fee.affectedDays) {
                        const affectedDaysArray = fee.affectedDays.split(",").map((day) => day.trim().toLowerCase());
        
                        if (affectedDaysArray.includes(eventDayOfWeek) || affectedDaysArray.includes("all")) {
                            totalAdjustment += isSurcharge ? fee.fee : -fee.fee; // Soma ou subtrai a porcentagem
                        }
                    }
                });
        
                // Aplica o ajuste total no preço por pessoa por hora
                if (totalAdjustment !== 0) {
                    pricePerPerson += pricePerPerson * (totalAdjustment / 100);
                }
            }
            const basePrice = Number(guestNumber) * pricePerPerson

            const extraHourPrice = calcExtraHourPrice(basePrice);
            const extraHoursQty = calcExtraHoursQty(eventDurantion);

            const totalAmount = basePrice + (totalAmountService || 0) + extraHourPrice * extraHoursQty;

            createProposalPerPersonInDb = {
                ...rest,
                endDate,
                startDate,
                basePrice,
                serviceIds,
                totalAmount,
                extraHoursQty,
                extraHourPrice,
                guestNumber: Number(guestNumber)
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
                    }).format(newProposal.totalAmount)}, para data  ${format(
                        newProposal?.startDate,
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

        if (Number(totalAmountInput) === 0 && venue.pricePerPersonHour && venue.pricingModel === "PER_PERSON_HOUR") {

            const { endDate, startDate } = transformDate({
                date,
                endHour,
                startHour,
            });

            const eventDurantion = calcEventDuration(endDate, startDate);
            const { seasonalFee } = venue

            let totalAdjustment = 0;
            let pricePerPersonHour = venue.pricePerPersonHour;
        
            if (seasonalFee && seasonalFee.length > 0) {
                const year = startDate.getFullYear();
                const eventDayOfWeek = format(startDate, "EEEE").toLowerCase(); // "friday"
        
                seasonalFee.forEach((fee) => {
                    const isSurcharge = fee.type === "SURCHARGE";
                    const isDiscount = fee.type === "DISCOUNT";
        
                    // Verifica se a data do evento está dentro do intervalo sazonal
                    if (fee.startDay && fee.endDay) {
                        const seasonalStart = setYear(parse(fee.startDay, "dd/MM", new Date()), year);
                        const seasonalEnd = setYear(parse(fee.endDay, "dd/MM", new Date()), year);
        
                        if (isWithinInterval(startDate, { start: seasonalStart, end: seasonalEnd })) {
                            totalAdjustment += isSurcharge ? fee.fee : -fee.fee; // Soma ou subtrai a porcentagem
                        }
                    }
        
                    // Verifica se a data do evento está dentro dos dias da semana afetados
                    if (fee.affectedDays) {
                        const affectedDaysArray = fee.affectedDays.split(",").map((day) => day.trim().toLowerCase());
        
                        if (affectedDaysArray.includes(eventDayOfWeek) || affectedDaysArray.includes("all")) {
                            totalAdjustment += isSurcharge ? fee.fee : -fee.fee; // Soma ou subtrai a porcentagem
                        }
                    }
                });
        
                // Aplica o ajuste total no preço por pessoa por hora
                if (totalAdjustment !== 0) {
                    pricePerPersonHour += pricePerPersonHour * (totalAdjustment / 100);
                }
            }

            const calcBasePrice = eventDurantion * (Number(guestNumber) * pricePerPersonHour)

            const extraHourPrice = calcBasePrice / eventDurantion;
            const totalAmount = calcBasePrice + (totalAmountService || 0);

            createProposalPerPersonInDb = {
                ...rest,
                endDate,
                startDate,
                basePrice: calcBasePrice,
                serviceIds,
                totalAmount,
                extraHoursQty: 0,
                extraHourPrice,
                guestNumber: Number(guestNumber)
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
                    }).format(newProposal.totalAmount)}, para data  ${format(
                        newProposal?.startDate,
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

        if (totalAmountInput) {

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

            createProposalPerPersonInDb = {
                ...rest,
                endDate,
                startDate,
                basePrice,
                serviceIds,
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
                    }).format(newProposal.totalAmount)}, para data  ${format(
                        newProposal?.startDate,
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
import { format, isWithinInterval, parse, setYear } from "date-fns";
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
import { SeasonalFee, Venue } from "@prisma/client";


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

        const venue = await this.venueRepository.getById({ venueId: params.venueId }) as Venue & { seasonalFee: SeasonalFee[] };

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

        if (Number(totalAmountInput) === 0 && venue.pricingModel === "PER_DAY" && venue.pricePerDay) {
            const { seasonalFee } = venue
            const daysBetween = differenceInCalendarDays(endDate, startDate);
            let totalAdjustment = 0;
            let pricePerDay = venue.pricePerDay;

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
                    pricePerDay += pricePerDay * (totalAdjustment / 100);
                }
            }

            const basePrice = daysBetween * pricePerDay;
            const totalAmount = basePrice + (totalAmountService || 0);

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

            if (!userId) {
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

        if (Number(totalAmountInput) === 0 && venue.pricingModel === "PER_PERSON_DAY" && venue.pricePerPersonDay) {

            const { seasonalFee } = venue
            const daysBetween = differenceInCalendarDays(endDate, startDate);
            let totalAdjustment = 0;
            let pricePerPersonDay = venue.pricePerPersonDay;

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
                    pricePerPersonDay += pricePerPersonDay * (totalAdjustment / 100);
                }
            }

            const basePrice = daysBetween * (Number(guestNumber) * pricePerPersonDay)
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

            if (!userId) {
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

export { CreateProposalPerDayUseCase }
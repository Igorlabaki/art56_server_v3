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
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface";
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface";


class CreateProposalPerDayUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private goalRepository: GoalRepositoryInterface,
        private venueRepository: VenueRepositoryInterface,
        private userVenuePermissionRepository: UserVenuePermissionRepositoryInterface,
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

        const venue = await this.venueRepository.getById({ venueId: params.venueId }) as Venue & { seasonalFee: SeasonalFee[] };

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }

        const userVenuePermission = await this.userVenuePermissionRepository.getUserVenuePermission({organizationId: venue.organizationId, userId: userId as string, venueId: venue.id})
        

        const { startDate } = transformDate({ date: params.startDay, endHour: params.endHour, startHour: venue.checkIn ? venue.checkIn : params.startHour, divisor: "/" })
        const { endDate } = transformDate({ date: params.endDay, endHour: venue.checkOut ? venue.checkOut : params.endHour, startHour: venue.checkOut ? venue.checkOut : params.endHour, divisor: "/" })

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
                content: `Novo orcamento do(a) ${newProposal.completeClientName
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
            const { seasonalFee } = venue;
            const daysBetween = differenceInCalendarDays(endDate, startDate);
            let pricePerDay = venue.pricePerDay;

            if (seasonalFee?.length) {
                const year = startDate.getFullYear();
                const eventDayOfWeek = format(startDate, "EEEE").toLowerCase();
                const totalAdjustment = seasonalFee.reduce((adjustment, fee) => {
                    const isSurcharge = fee.type === "SURCHARGE";
                    const feeValue = isSurcharge ? fee.fee : -fee.fee;
                    const start = setYear(parse(fee.startDay ?? "", "dd/MM", new Date()), year);
                    let end = setYear(parse(fee.endDay ?? "", "dd/MM", new Date()), year);
                    if (end < start) {
                        end = setYear(parse(fee.endDay ?? "", "dd/MM", new Date()), year + 1);
                    }
                    const isInSeason = fee.startDay && fee.endDay
                        ? isWithinInterval(startDate, { start, end })
                        : false;
                    const isAffectedDay = fee.affectedDays
                        ? fee.affectedDays.split(",").map(d => d.trim().toLowerCase()).includes(eventDayOfWeek) || fee.affectedDays.includes("all")
                        : false;
                    return adjustment + (isInSeason || isAffectedDay ? feeValue : 0);
                }, 0);

                pricePerDay += pricePerDay * totalAdjustment / 100;
            }

            const totalPerSelectMonth = await this.proposalRepository.monthlyRevenueAnalysis({
                venueId: venue.id,
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1,
                approved: true
            })

            if (totalPerSelectMonth) {
                const goal = await this.goalRepository.findByVenueAndRevenue({
                    venueId: venue.id,
                    monthlyRevenue: totalPerSelectMonth,
                    targetMonth: String(startDate.getMonth() + 1)
                })

                if (goal?.increasePercent) {
                    pricePerDay += pricePerDay * goal?.increasePercent / 100
                }

                const basePrice = daysBetween * pricePerDay;
                const totalAmount = basePrice + (totalAmountService || 0);
                
                let finalBasePrice = basePrice;
                let finalTotalAmount = totalAmount;
                if (venue.minimumPrice && totalAmount < venue.minimumPrice) {
                    finalBasePrice = venue.minimumPrice;
                    finalTotalAmount = venue.minimumPrice + (totalAmountService || 0);
                }

                const createProposalPerPersonInDb = {
                    ...rest,
                    endDate,
                    startDate,
                    basePrice: finalBasePrice,
                    serviceIds,
                    totalAmount: finalTotalAmount,
                    extraHoursQty: 0,
                    extraHourPrice: 0,
                    guestNumber: Number(guestNumber),
                };

                const newProposal = await this.proposalRepository.createPerPerson(createProposalPerPersonInDb);
                if (!newProposal) throw Error("Erro na conexao com o banco de dados");

                await this.notificationRepository.create({
                    venueId: params.venueId,
                    proposalId: newProposal.id,
                    content: `Novo orçamento de ${newProposal.completeClientName} no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(newProposal.totalAmount)}, para ${format(newProposal.startDate, "dd/MM/yyyy")}`,
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

            const basePrice = daysBetween * pricePerDay;
            const totalAmount = basePrice + (totalAmountService || 0);
            let finalBasePrice = basePrice;
            let finalTotalAmount = totalAmount;
            if (venue.minimumPrice && totalAmount < venue.minimumPrice) {
                finalBasePrice = venue.minimumPrice;
                finalTotalAmount = venue.minimumPrice + (totalAmountService || 0);
            }

            const createProposalPerDayInDb = {
                ...rest,
                endDate,
                startDate,
                serviceIds,
                basePrice: finalBasePrice,
                extraHoursQty: 0,
                extraHourPrice: 0,
                totalAmount: finalTotalAmount,
                guestNumber: Number(guestNumber),
            };

            const newProposal = await this.proposalRepository.createPerDay(createProposalPerDayInDb);
            if (!newProposal) throw Error("Erro na conexão com o banco de dados");

            await this.notificationRepository.create({
                venueId: params.venueId,
                proposalId: newProposal.id,
                content: `Novo orçamento de ${newProposal.completeClientName} no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(newProposal.totalAmount)}, para ${format(newProposal.startDate, "dd/MM/yyyy")} até ${format(newProposal.endDate, "dd/MM/yyyy")}`,
                type: "PROPOSAL",
            });

            if (userId) {
                const user = await this.userRepository.getById(userId);
                if (!user) throw new HttpResourceNotFoundError("Usuário");
                await this.historyRepository.create({
                    userId: user.id,
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
                count: 1,
                data: newProposal,
                type: "Proposal",
            };
        } else if (Number(totalAmountInput) === 0 && venue.pricingModel === "PER_PERSON_DAY" && venue.pricePerPersonDay) {
            const { seasonalFee } = venue;
            const daysBetween = differenceInCalendarDays(endDate, startDate);
            let pricePerPersonDay = venue.pricePerPersonDay;

            if (seasonalFee?.length) {
                const year = startDate.getFullYear();
                const eventDayOfWeek = format(startDate, "EEEE").toLowerCase();
                const totalAdjustment = seasonalFee.reduce((adjustment, fee) => {
                    const isSurcharge = fee.type === "SURCHARGE";
                    const feeValue = isSurcharge ? fee.fee : -fee.fee;
                    const start = setYear(parse(fee.startDay ?? "", "dd/MM", new Date()), year);
                    let end = setYear(parse(fee.endDay ?? "", "dd/MM", new Date()), year);
                    if (end < start) {
                        end = setYear(parse(fee.endDay ?? "", "dd/MM", new Date()), year + 1);
                    }
                    const isInSeason = fee.startDay && fee.endDay
                        ? isWithinInterval(startDate, { start, end })
                        : false;
                    const isAffectedDay = fee.affectedDays
                        ? fee.affectedDays.split(",").map(d => d.trim().toLowerCase()).includes(eventDayOfWeek) || fee.affectedDays.includes("all")
                        : false;
                    return adjustment + (isInSeason || isAffectedDay ? feeValue : 0);
                }, 0);

                pricePerPersonDay += pricePerPersonDay * totalAdjustment / 100;
            }

            const totalPerSelectMonth = await this.proposalRepository.monthlyRevenueAnalysis({
                venueId: venue.id,
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1,
                approved: true
            })

            if (totalPerSelectMonth) {
                const goal = await this.goalRepository.findByVenueAndRevenue({
                    venueId: venue.id,
                    monthlyRevenue: totalPerSelectMonth,
                    targetMonth: String(startDate.getMonth() + 1)
                })

                if (goal?.increasePercent) {
                    pricePerPersonDay += pricePerPersonDay * goal?.increasePercent / 100
                }

                const basePrice = daysBetween * (pricePerPersonDay * Number(guestNumber));
                const totalAmount = basePrice + (totalAmountService || 0);

                let finalBasePrice = basePrice;
                let finalTotalAmount = totalAmount;
                if (venue.minimumPrice && totalAmount < venue.minimumPrice) {
                    finalBasePrice = venue.minimumPrice;
                    finalTotalAmount = venue.minimumPrice + (totalAmountService || 0);
                }

                createProposalPerDayInDb = {
                    ...rest,
                    endDate,
                    startDate,
                    serviceIds,
                    basePrice: finalBasePrice,
                    totalAmount: finalTotalAmount,
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
                    content: `Novo orcamento do(a) ${newProposal.completeClientName
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

            const basePrice = daysBetween * (pricePerPersonDay * Number(guestNumber));
            const totalAmount = basePrice + (totalAmountService || 0);
            let finalBasePrice = basePrice;
            let finalTotalAmount = totalAmount;
            if (venue.minimumPrice && totalAmount < venue.minimumPrice) {
                finalBasePrice = venue.minimumPrice;
                finalTotalAmount = venue.minimumPrice + (totalAmountService || 0);
            }

            createProposalPerDayInDb = {
                ...rest,
                endDate,
                startDate,
                serviceIds,
                basePrice: finalBasePrice,
                totalAmount: finalTotalAmount,
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
                content: `Novo orcamento do(a) ${newProposal.completeClientName
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
        } else {
            const basePrice = (Number(totalAmountInput) || 0) - (totalAmountService || 0);
            const totalAmount = Number(totalAmountInput) || 0;
            let finalBasePrice = basePrice;
            let finalTotalAmount = totalAmount;
            if (venue.minimumPrice && totalAmount < venue.minimumPrice) {
                finalBasePrice = venue.minimumPrice;
                finalTotalAmount = venue.minimumPrice + (totalAmountService || 0);
            }

            createProposalPerDayInDb = {
                ...rest,
                endDate,
                startDate,
                basePrice: finalBasePrice,
                serviceIds,
                extraHoursQty: 0,
                extraHourPrice: 0,
                guestNumber: Number(guestNumber),
                totalAmount: finalTotalAmount,
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
                content: `Novo orcamento do(a) ${newProposal.completeClientName
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

            return formatedResponse;
        }
    }
}

export { CreateProposalPerDayUseCase }
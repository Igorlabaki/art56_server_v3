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


class CreateProposalPerDayUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private goalRepository: GoalRepositoryInterface,
        private venueRepository: VenueRepositoryInterface,
        private serviceRepository: ServiceRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
        private notificationRepository: NotificationRepositoryInterface,
    ) { }

    async execute(params: CreateProposalPerDayRequestParamsSchema) {
        console.log("[UseCase] Iniciando execução do caso de uso");
        console.log("[UseCase] Parâmetros recebidos:", JSON.stringify(params, null, 2));

        let createProposalPerDayInDb: CreateProposalInDbParams;

        const { startDay, endDay, endHour, startHour, totalAmountInput, serviceIds, guestNumber, userId, ...rest } = params
        console.log("[UseCase] Parâmetros extraídos:", { startDay, endDay, endHour, startHour, totalAmountInput, serviceIds, guestNumber, userId });

        console.log("[UseCase] Buscando valor total dos serviços");
        const totalAmountService = await this.serviceRepository.getByProposalServiceListTotalAmount({
            serviceIds,
            venueId: params.venueId,
        })
        console.log("[UseCase] Valor total dos serviços:", totalAmountService);



        console.log("[UseCase] Buscando local");
        const venue = await this.venueRepository.getById({ venueId: params.venueId }) as Venue & { seasonalFee: SeasonalFee[] };
        console.log("[UseCase] Local encontrado:", venue ? "Sim" : "Não");

        if (!venue) {
            console.error("[UseCase] Local não encontrado");
            throw new HttpResourceNotFoundError("Locacao")
        }

        console.log("[UseCase] Transformando datas");
        const { startDate } = transformDate({ date: params.startDay, endHour: params.endHour, startHour: venue.checkIn ? venue.checkIn : params.startHour, divisor: "/" })
        const { endDate } = transformDate({ date: params.endDay, endHour: venue.checkOut ? venue.checkOut : params.endHour, startHour: venue.checkOut ? venue.checkOut : params.endHour, divisor: "/" })
        console.log("[UseCase] Datas transformadas:", { startDate, endDate });

        console.log("[UseCase] Verificando modelo de preço do local:", {
            pricingModel: venue.pricingModel,
            pricePerDay: venue.pricePerDay,
            pricePerPersonDay: venue.pricePerPersonDay,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        if (params.type === "BARTER") {
            console.log("[UseCase] Iniciando criação de proposta de permuta");
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

            console.log("[UseCase] Criando proposta de permuta no banco");
            const newProposal = await this.proposalRepository.createPerDay(
                createProposalPerDayInDb
            );

            if (!newProposal) {
                console.error("[UseCase] Erro ao criar proposta de permuta no banco");
                throw Error("Erro na conexao com o banco de dados")
            }

            console.log("[UseCase] Criando notificação para proposta de permuta");
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
                console.log("[UseCase] Buscando usuário para histórico");
                const user = await this.userRepository.getById(userId)

                if (!user) {
                    console.error("[UseCase] Usuário não encontrado");
                    throw new HttpResourceNotFoundError("Usuario")
                }

                console.log("[UseCase] Criando histórico para usuário");
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

            console.log(formatedResponse)

            console.log("[UseCase] Proposta de permuta criada com sucesso");
            return formatedResponse
        }

        if (Number(totalAmountInput) === 0 && venue.pricingModel === "PER_DAY" && venue.pricePerDay) {
            console.log("[UseCase] Iniciando criação de proposta por dia");
            const { seasonalFee } = venue;
            const daysBetween = differenceInCalendarDays(endDate, startDate);
            let pricePerDay = venue.pricePerDay;

            // Aplica ajustes de sazonalidade no preço diário
            if (seasonalFee?.length) {
                const year = startDate.getFullYear();
                const eventDayOfWeek = format(startDate, "EEEE").toLowerCase();
                console.log("eventDayOfWeek", eventDayOfWeek)
                const totalAdjustment = seasonalFee.reduce((adjustment, fee) => {
                    const isSurcharge = fee.type === "SURCHARGE";
                    console.log("isSurcharge", isSurcharge)
                    const feeValue = isSurcharge ? fee.fee : -fee.fee;
                    console.log("feeValue", feeValue)
                    const isInSeason = fee.startDay && fee.endDay
                        ? isWithinInterval(startDate, {
                            start: setYear(parse(fee.startDay, "dd/MM", new Date()), year),
                            end: setYear(parse(fee.endDay, "dd/MM", new Date()), year),
                        })
                        : false;
                    console.log("isInSeason", isInSeason)
                    const isAffectedDay = fee.affectedDays
                        ? fee.affectedDays.split(",").map(d => d.trim().toLowerCase()).includes(eventDayOfWeek) || fee.affectedDays.includes("all")
                        : false;
                    console.log("isAffectedDay", isAffectedDay)
                    console.log("adjustment", adjustment + (isInSeason || isAffectedDay ? feeValue : 0))
                    return adjustment + (isInSeason || isAffectedDay ? feeValue : 0);
                }, 0);

                // Aplica o ajuste no preço
                pricePerDay += pricePerDay * totalAdjustment / 100;
                console.log("pricePerDay", pricePerDay)
            }

            const totalPerSelectMonth = await this.proposalRepository.monthlyRevenueAnalysis({
                venueId: venue.id,
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1,
                approved: true
            })
            console.log("totalPerSelectMonth", totalPerSelectMonth)
            if (totalPerSelectMonth) {
                const goal = await this.goalRepository.findByVenueAndRevenue({
                    venueId: venue.id,
                    monthlyRevenue: totalPerSelectMonth,
                    targetMonth: String(startDate.getMonth() + 1)
                })
                console.log("goal", goal)
                if (goal?.increasePercent) {
                    pricePerDay += pricePerDay * goal?.increasePercent / 100
                }
                console.log("pricePerDay", pricePerDay)
                const basePrice = daysBetween * pricePerDay;
                const totalAmount = basePrice + (totalAmountService || 0);
                console.log("[UseCase] Valores antes da verificação do mínimo:", {
                    basePrice,
                    totalAmountService,
                    totalAmount,
                    minimumPrice: venue.minimumPrice
                });
                
                // Se tiver preço mínimo e o total for menor, usa o mínimo
                let finalBasePrice = basePrice;
                let finalTotalAmount = totalAmount;
                if (venue.minimumPrice && totalAmount < venue.minimumPrice) {
                    finalBasePrice = venue.minimumPrice;
                    finalTotalAmount = venue.minimumPrice + (totalAmountService || 0);
                }

                console.log("[UseCase] Valor final após verificação do mínimo:", {
                    totalAmount,
                    minimumPrice: venue.minimumPrice,
                    finalTotalAmount,
                    finalBasePrice
                });

                // Cria a proposta
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
                console.log("createProposalPerPersonInDb", createProposalPerPersonInDb)
                const newProposal = await this.proposalRepository.createPerPerson(createProposalPerPersonInDb);
                if (!newProposal) throw Error("Erro na conexao com o banco de dados");

                // Envia notificação e histórico
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

            // Calcula o preço base
            const basePrice = daysBetween * pricePerDay;
            const totalAmount = basePrice + (totalAmountService || 0);
            let finalBasePrice = basePrice;
            let finalTotalAmount = totalAmount;
            if (venue.minimumPrice && totalAmount < venue.minimumPrice) {
                finalBasePrice = venue.minimumPrice;
                finalTotalAmount = venue.minimumPrice + (totalAmountService || 0);
            }
            // Criação da proposta
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

            // Envia notificação e histórico
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
            console.log("[UseCase] Iniciando criação de proposta por pessoa por dia");
            const { seasonalFee } = venue;
            const daysBetween = differenceInCalendarDays(endDate, startDate);
            let pricePerPersonDay = venue.pricePerPersonDay;
            console.log("pricePerPersonDay", pricePerPersonDay)
            if (seasonalFee?.length) {
                const year = startDate.getFullYear();
                const eventDayOfWeek = format(startDate, "EEEE").toLowerCase();
                console.log("eventDayOfWeek", eventDayOfWeek)
                const totalAdjustment = seasonalFee.reduce((adjustment, fee) => {
                    const isSurcharge = fee.type === "SURCHARGE";
                    const feeValue = isSurcharge ? fee.fee : -fee.fee;
                    console.log("feeValue", feeValue)
                    const isInSeason = fee.startDay && fee.endDay
                        ? isWithinInterval(startDate, {
                            start: setYear(parse(fee.startDay, "dd/MM", new Date()), year),
                            end: setYear(parse(fee.endDay, "dd/MM", new Date()), year),
                        })
                        : false;

                    const isAffectedDay = fee.affectedDays
                        ? fee.affectedDays.split(",").map(d => d.trim().toLowerCase()).includes(eventDayOfWeek) || fee.affectedDays.includes("all")
                        : false;

                    return adjustment + (isInSeason || isAffectedDay ? feeValue : 0);
                }, 0);

                // Aplica o ajuste no preço
                pricePerPersonDay += pricePerPersonDay * totalAdjustment / 100;
            }

            const totalPerSelectMonth = await this.proposalRepository.monthlyRevenueAnalysis({
                venueId: venue.id,
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1,
                approved: true
            })
            console.log("totalPerSelectMonth", totalPerSelectMonth)
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
                console.log("[UseCase] Valores antes da verificação do mínimo:", {
                    basePrice,
                    totalAmountService,
                    totalAmount,
                    minimumPrice: venue.minimumPrice
                });

                // Se tiver preço mínimo e o total for menor, usa o mínimo
                let finalBasePrice = basePrice;
                let finalTotalAmount = totalAmount;
                if (venue.minimumPrice && totalAmount < venue.minimumPrice) {
                    finalBasePrice = venue.minimumPrice;
                    finalTotalAmount = venue.minimumPrice + (totalAmountService || 0);
                }

                console.log("[UseCase] Valor final após verificação do mínimo:", {
                    totalAmount,
                    minimumPrice: venue.minimumPrice,
                    finalTotalAmount,
                    finalBasePrice
                });

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
                console.log("newProposal", newProposal)
                if (!newProposal) {
                    throw Error("Erro na conexao com o banco de dados")
                }

                const not = await this.notificationRepository.create({
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
                console.log("notificacao criada", not)

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
            console.log("newProposal", newProposal)
            if (!newProposal) {
                throw Error("Erro na conexao com o banco de dados")
            }

            const not = await this.notificationRepository.create({
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
            console.log("notificacao criada", not)

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
            console.log("[UseCase] Nenhuma condição de preço atendida, usando valor manual");
            // Se chegou aqui, é porque é um valor manual
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

            console.log(formatedResponse)

            console.log("[UseCase] Finalizando execução do caso de uso");
            return formatedResponse;
        }
    }
}

export { CreateProposalPerDayUseCase }
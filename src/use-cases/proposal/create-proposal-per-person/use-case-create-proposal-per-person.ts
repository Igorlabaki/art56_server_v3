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
import { Payment, SeasonalFee, Venue } from "@prisma/client";
import { GoalRepositoryInterface } from "../../../repositories/interface/goal-repository-interface";
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface";
import { FirebaseNotificationService } from "../../../services/firebase-notification-service";

class CreateProposalPerPersonUseCase {
    constructor(
        private userRepository: UserRepositoryInterface,
        private goalRepository: GoalRepositoryInterface,
        private venueRepository: VenueRepositoryInterface,
        private serviceRepository: ServiceRepositoryInterface,
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
        private notificationRepository: NotificationRepositoryInterface,
        private userOrganizationRepository: UserOrganizationRepositoryInterface,
    ) { }

    private async sendNotificationToAdmins({venueId, proposalId, content}:{venueId: string, proposalId: string, content: string}) {
        // Buscar a venue para obter a organização
        const venue = await this.venueRepository.getById({ venueId });
        if (!venue) return;
       
        // Buscar todas as permissões de usuário para esta venue
        const userOrganizations = await this.userOrganizationRepository.listByOrganization({
            organizationId: venue.organizationId,
            venueId,
        });
        console.log("userOrganizations", userOrganizations)
        if (!userOrganizations) return;

        const notificationService = FirebaseNotificationService.getInstance();
        console.log("notificationService", notificationService)
        // Para cada permissão, buscar o usuário e enviar notificação se tiver token FCM
         userOrganizations.map(async (userOrganization) => {
            if (userOrganization.user.fcmToken) {
                await notificationService.sendNotification(
                    userOrganization.user.fcmToken,
                    "Novo Orçamento",
                    content
                );
            }
        })
    }

    async execute(params: CreateProposalPerPersonRequestParamsSchema) {
        let createProposalPerPersonInDb: CreateProposalInDbParams;
        console.log("cheguei no usecase")
        const { date, endHour, startHour, totalAmountInput, serviceIds, guestNumber, userId, ...rest } = params

        const totalAmountService = await this.serviceRepository.getByProposalServiceListTotalAmount({
            serviceIds,
            venueId: params.venueId,
        })
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

            const notificationContent = `Novo orcamento do(a) ${newProposal.completeClientName} de permuta, para data ${format(newProposal?.startDate, "dd/MM/yyyy")}`;

            // Criar notificação no banco
            await this.notificationRepository.create({
                venueId: params.venueId,
                proposalId: newProposal.id,
                content: notificationContent,
                type: "PROPOSAL",
            });

            // Enviar notificação para os administradores
            await this.sendNotificationToAdmins({venueId: params.venueId, proposalId: newProposal.id, content: notificationContent});

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

        if (Number(totalAmountInputFormated) === 0 && venue.pricePerPerson && venue.pricingModel === "PER_PERSON") {
            console.log("cheguei no if PER PERSON")
            const { endDate, startDate } = transformDate({ date, endHour, startHour });
            const { seasonalFee } = venue;
            const eventDuration = calcEventDuration(startDate, endDate);
            let extraHoursQtyCalculated = 0;
            console.log(endDate, startDate, eventDuration, venue.pricePerPerson, venue.pricingModel)

            let pricePerPerson = venue.pricePerPerson;


            // Aplica ajustes de sazonalidade no preço por pessoa
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

                // Aplica o ajuste no preço
                pricePerPerson += pricePerPerson * totalAdjustment / 100;
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
                    pricePerPerson += pricePerPerson * goal?.increasePercent / 100
                }

                const calculatedBasePrice = Number(guestNumber) * pricePerPerson;

                const extraHourPrice = calcExtraHourPrice(calculatedBasePrice);
                if (venue.standardEventDuration) {
                    extraHoursQtyCalculated = calcExtraHoursQty(eventDuration, venue.standardEventDuration);
                } else {
                    extraHoursQtyCalculated = 0;
                }
                
                const totalAmount = calculatedBasePrice + (totalAmountService || 0) + extraHourPrice * extraHoursQtyCalculated;

                // Se tiver preço mínimo e o total for menor, usa o mínimo como basePrice
                let basePrice = calculatedBasePrice;
                let finalTotalAmount = totalAmount;
                
                if (venue.minimumPrice && totalAmount < venue.minimumPrice) {
                    basePrice = venue.minimumPrice;
                    finalTotalAmount = venue.minimumPrice + (totalAmountService || 0);
                }

                // Cria a proposta
                const createProposalPerPersonInDb = {
                    ...rest,
                    endDate,
                    startDate,
                    basePrice,
                    serviceIds,
                    totalAmount: finalTotalAmount,
                    extraHoursQty: extraHoursQtyCalculated,
                    extraHourPrice,
                    guestNumber: Number(guestNumber),
                };

                const newProposal = await this.proposalRepository.createPerPerson(createProposalPerPersonInDb);
                if (!newProposal) throw Error("Erro na conexao com o banco de dados");
                console.log("newProposal", newProposal)
                const notificationContent = `Novo orcamento de ${newProposal.completeClientName} no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(newProposal.totalAmount)}, para ${format(newProposal.startDate, "dd/MM/yyyy")}`;

                // Envia notificação e histórico
                await this.notificationRepository.create({
                    venueId: params.venueId,
                    proposalId: newProposal.id,
                    content: notificationContent,
                    type: "PROPOSAL",
                });

                // Enviar notificação para os administradores
                await this.sendNotificationToAdmins({venueId: params.venueId, proposalId: newProposal.id, content: notificationContent});

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

            // Calcula o preço total
            const calculatedBasePrice = Number(guestNumber) * pricePerPerson;
            const extraHourPrice = calcExtraHourPrice(calculatedBasePrice);
            
            if (venue.standardEventDuration) {
                extraHoursQtyCalculated = calcExtraHoursQty(eventDuration, venue.standardEventDuration);
            } else {
                extraHoursQtyCalculated = 0;
            }
            const totalAmount = calculatedBasePrice + (totalAmountService || 0) + extraHourPrice * extraHoursQtyCalculated;

            // Se tiver preço mínimo e o total for menor, usa o mínimo como basePrice
            let basePrice = calculatedBasePrice;
            let finalTotalAmount = totalAmount;
            
            if (venue.minimumPrice && totalAmount < venue.minimumPrice) {
                basePrice = venue.minimumPrice;
                finalTotalAmount = venue.minimumPrice + (totalAmountService || 0);
            }

            // Cria a proposta
            const createProposalPerPersonInDb = {
                ...rest,
                endDate,
                startDate,
                basePrice,
                serviceIds,
                totalAmount: finalTotalAmount,
                extraHoursQty: extraHoursQtyCalculated,
                extraHourPrice,
                guestNumber: Number(guestNumber),
            };

            const newProposal = await this.proposalRepository.createPerPerson(createProposalPerPersonInDb);
            if (!newProposal) throw Error("Erro na conexao com o banco de dados");

            const notificationContent = `Novo orcamento de ${newProposal.completeClientName} no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(newProposal.totalAmount)}, para ${format(newProposal.startDate, "dd/MM/yyyy")}`;

            // Envia notificação e histórico
            await this.notificationRepository.create({
                venueId: params.venueId,
                proposalId: newProposal.id,
                content: notificationContent,
                type: "PROPOSAL",
            });

            
            // Enviar notificação para os administradores
            const lognotification = await this.sendNotificationToAdmins({venueId: params.venueId, proposalId: newProposal.id, content: notificationContent});
            console.log("lognotification", lognotification)

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

        if (Number(totalAmountInputFormated) === 0 && venue.pricePerPersonHour && venue.pricingModel === "PER_PERSON_HOUR") {
            console.log("cheguei no if PER PERSON HOUR")
            const { endDate, startDate } = transformDate({ date, endHour, startHour });
            const eventDuration = calcEventDuration(startDate, endDate);
            const { seasonalFee } = venue;

            let pricePerPersonHour = venue.pricePerPersonHour;

            // Aplica ajustes de sazonalidade no preço por pessoa por hora
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

                // Aplica o ajuste no preço por hora
                pricePerPersonHour += pricePerPersonHour * totalAdjustment / 100;
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
                    pricePerPersonHour += pricePerPersonHour * goal?.increasePercent / 100
                }

                const calculatedBasePrice = Number(guestNumber) * pricePerPersonHour;
                const extraHourPrice = calcExtraHourPrice(calculatedBasePrice);
                let extraHoursQtyCalculated = 0;
                if (venue.standardEventDuration) {
                    extraHoursQtyCalculated = calcExtraHoursQty(eventDuration, venue.standardEventDuration);
                } else {
                    extraHoursQtyCalculated = 0;
                }
                const totalAmount = calculatedBasePrice + (totalAmountService || 0) + extraHourPrice * extraHoursQtyCalculated;

                // Se tiver preço mínimo e o total for menor, usa o mínimo como basePrice
                let basePrice = calculatedBasePrice;
                let finalTotalAmount = totalAmount;
                
                if (venue.minimumPrice && totalAmount < venue.minimumPrice) {
                    basePrice = venue.minimumPrice;
                    finalTotalAmount = venue.minimumPrice + (totalAmountService || 0);
                }

                // Cria a proposta
                const createProposalPerPersonInDb = {
                    ...rest,
                    endDate,
                    startDate,
                    basePrice,
                    serviceIds,
                    totalAmount: finalTotalAmount,
                    extraHoursQty: extraHoursQtyCalculated,
                    extraHourPrice,
                    guestNumber: Number(guestNumber),
                };

                const newProposal = await this.proposalRepository.createPerPerson(createProposalPerPersonInDb);
                if (!newProposal) throw Error("Erro na conexao com o banco de dados");

                const notificationContent = `Novo orcamento de ${newProposal.completeClientName} no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(newProposal.totalAmount)}, para ${format(newProposal.startDate, "dd/MM/yyyy")}`;

                // Envia notificação e histórico
                await this.notificationRepository.create({
                    venueId: params.venueId,
                    proposalId: newProposal.id,
                    content: notificationContent,
                    type: "PROPOSAL",
                });

                // Enviar notificação para os administradores
                await this.sendNotificationToAdmins({venueId: params.venueId, proposalId: newProposal.id, content: notificationContent});

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
            const calculatedBasePrice = eventDuration * (Number(guestNumber) * pricePerPersonHour);
            const extraHourPrice = calculatedBasePrice / eventDuration;
            const totalAmount = calculatedBasePrice + (totalAmountService || 0);

            // Se tiver preço mínimo e o total for menor, usa o mínimo como basePrice
            let basePrice = calculatedBasePrice;
            let finalTotalAmount = totalAmount;
            
            if (venue.minimumPrice && totalAmount < venue.minimumPrice) {
                basePrice = venue.minimumPrice;
                finalTotalAmount = venue.minimumPrice + (totalAmountService || 0);
            }

            // Criação da proposta
            const createProposalPerPersonInDb = {
                ...rest,
                endDate,
                startDate,
                basePrice,
                serviceIds,
                totalAmount: finalTotalAmount,
                extraHoursQty: 0,
                extraHourPrice,
                guestNumber: Number(guestNumber),
            };

            const newProposal = await this.proposalRepository.createPerPerson(createProposalPerPersonInDb);
            if (!newProposal) throw Error("Erro na conexão com o banco de dados");

            const notificationContent = `Novo orcamento de ${newProposal.completeClientName} no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(newProposal.totalAmount)}, para ${format(newProposal.startDate, "dd/MM/yyyy")}`;

            // Envia notificação e histórico
            await this.notificationRepository.create({
                venueId: params.venueId,
                proposalId: newProposal.id,
                content: notificationContent,
                type: "PROPOSAL",
            });

            // Enviar notificação para os administradores
            await this.sendNotificationToAdmins({venueId: params.venueId, proposalId: newProposal.id, content: notificationContent});

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
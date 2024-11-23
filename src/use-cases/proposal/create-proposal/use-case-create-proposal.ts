import { format } from "date-fns";
import { calcCustomTotalAmount } from "../../../functions/calc-custom-total-amount";
import { CreateProposalRequestParamsSchema } from "../../../zod/proposal/create-proposal-params-schema"
import { ServiceRepositoryInterface } from "../../../repositories/interface/service-repository-interface";
import { NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";
import { CreateProposalInDbParams, ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface"
import { transformDate } from "../../../functions/transform-date";
import { calcStandartTotalAmount } from "../../../functions/calc-standart-total-amount";

class CreateProposalUseCase {
    constructor(
        private proposalRepository: ProposalRepositoryInterface,
        private serviceRepository: ServiceRepositoryInterface,
        private notificationRepository: NotificationRepositoryInterface,
    ) { }

    async execute(params: CreateProposalRequestParamsSchema) {

        let createProposalInDb: CreateProposalInDbParams;

        const { date, endHour, startHour, totalAmountInput, serviceIds, ...rest } = params

        const totalAmountService = await this.serviceRepository.getByProposalServiceListTotalAmount({
            serviceIds,
            venueId: params.venueId,
        })

        if (params.type === "BARTER") {
            const { endDate, startDate } = transformDate({ date: params.date, endHour: params.endHour, startHour: params.startHour, divisor: "/" })

            createProposalInDb = {
                ...rest,
                endDate,
                startDate,
                serviceIds,
                basePrice: 0,
                totalAmount: 0,
                extraHoursQty: 0,
                extraHourPrice: 0,
            }

            const newProposal = await this.proposalRepository.create(
                createProposalInDb
            );

            if (!newProposal) {
                throw Error("Erro na conexao com o banco de dados")
            }

            await this.notificationRepository.create({
                venueId: params.venueId,
                content: `Novo orcamento do(a) ${newProposal.name
                    } no valor de permuta, para data  ${format(
                        newProposal?.startDate,
                        "dd/MM/yyyy"
                    )}`,
                type: "PROPOSAL",
            });


            return { newProposal }
        }

        if (!totalAmountInput) {
            const { basePrice, endDate, extraHourPrice, extraHoursQty, startDate, totalAmount } =
                calcStandartTotalAmount({
                    data: {
                        type: params.type,
                        date,
                        guests: params.guests,
                        endHour,
                        startHour,
                        perPersonPrice: 100,
                        totalAmountService: totalAmountService || 0
                    },
                    divisor: "/",
                });

            createProposalInDb = {
                ...rest,
                endDate,
                startDate,
                basePrice,
                serviceIds,
                totalAmount,
                extraHoursQty,
                extraHourPrice,
            }

            const newProposal = await this.proposalRepository.create(
                createProposalInDb
            );

            if (!newProposal) {
                throw Error("Erro na conexao com o banco de dados")
            }

            await this.notificationRepository.create({
                venueId: params.venueId,
                content: `Novo orcamento do(a) ${newProposal.name
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

            return { newProposal }
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
                guests: params.guests,
                endHour,
                startHour,
                perPersonPrice: 100,
                totalAmountService: totalAmountService || 0,
                totalAmountInput
            },
            divisor: "/",
        });

        createProposalInDb = {
            ...rest,
            endDate,
            startDate,
            basePrice,
            serviceIds,
            totalAmount,
            extraHoursQty,
            extraHourPrice,
        }

        const newProposal = await this.proposalRepository.create(
            createProposalInDb
        );

        if (!newProposal) {
            throw Error("Erro na conexao com o banco de dados")
        }

        await this.notificationRepository.create({
            venueId: params.venueId,
            content: `Novo orcamento do(a) ${newProposal.name
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
        
        return { newProposal }
    }

}

export { CreateProposalUseCase }
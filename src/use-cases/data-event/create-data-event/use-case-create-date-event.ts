import { format } from "date-fns";
import { transformDate } from "../../../functions/transform-date";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { HttDateEventAvailableError } from "../../../errors/errors-type/http-date-not-available-error";
import { HistoryRepositoryInterface } from "../../../repositories/interface/history-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { DateEventRepositoryInterface } from "../../../repositories/interface/data-event-repository-interface";
import { NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";
import { CreateSameDayDateEventRequestParmsSchema } from "../../../zod/dataEvent/create-same-day-date-event-request-params-schema";

class CreateDateEventUseCase {
    constructor(
        private historyRepository: HistoryRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
        private dateEventRepository: DateEventRepositoryInterface,
        private notificationRepository: NotificationRepositoryInterface,
    ) { }

    async execute(params: CreateSameDayDateEventRequestParmsSchema) {
        const { proposalId, userId, username, venueId, data } = params
        const { date, endHour, startHour, ...rest } = data

        const { startDate } = transformDate({ date: date, endHour: endHour, startHour: startHour, divisor: "/" })
        const { endDate } = transformDate({ date: date, endHour: endHour, startHour: startHour, divisor: "/" })


        const isNotAvailable = await this.dateEventRepository.checkAvailability({
            venueId,
            endDate: startDate,
            startDate: endDate,
        });

        if (isNotAvailable) {
            throw new HttDateEventAvailableError();
        }

        const newDateEvent = await this.dateEventRepository.create({
            userId,
            username,
            venueId,
            proposalId,
            data: {
                ...rest,
                endDate,
                startDate,
            }
        })

        if (!newDateEvent) {
            throw new HttpConflictError("Data")
        }
        //

        if (newDateEvent && proposalId) {

            const types = [
                { display: "visita", data: "VISIT" },
                { display: "evento", data: "EVENT" },
                { display: "horario", data: "OTHER" },
                { display: "permuta", data: "BARTER" },
                { display: "estadia", data: "OVERNIGHT" },
                { display: "producao", data: "PRODUCTION" },
            ]

            const typeNotification = types.find((item: { display: string, data: string }) => { return item.data === data.type })

            if(typeNotification?.data === "EVENT" || typeNotification?.data === "PRODUCTION" || typeNotification?.data === "BARTER" ){
                await this.proposalRepository.update({
                    proposalId,
                    data:{
                        approved: true
                    }
                });
            }

            await this.historyRepository.create({
                userId: userId,
                proposalId: proposalId,
                action: `${username} agendou um(a) ${typeNotification?.display} para este orcamento`,
            });

            await this.notificationRepository.create({
                venueId: venueId,
                proposalId: proposalId,
                type: newDateEvent.type,
                content: `Um(a) ${typeNotification?.display} foi marcado(a), para data  ${format(startDate, "dd/MM/yyyy")}`,
            });
        }


        if (newDateEvent && !proposalId) {
            await this.notificationRepository.create({
                type: "OTHER",
                venueId: venueId,
                dataEventId: newDateEvent.id,
                content: `${newDateEvent.title} foi marcado(a), para data ${format(startDate, "dd/MM/yyyy")}`,
            });
        }

        const formatedResponse = {
            success: true,
            message: "Data foi cadastrada com sucesso",
            data: {
                ...newDateEvent
            },
            count: 1,
            type: "DateEvent"
        }

        return formatedResponse 
    }
}

export { CreateDateEventUseCase }
import { format } from "date-fns";
import { transformDate } from "../../../functions/transform-date";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { HttDateEventAvailableError } from "../../../errors/errors-type/http-date-not-available-error";
import { HistoryRepositoryInterface } from "../../../repositories/interface/history-repository-interface";
import { DateEventRepositoryInterface } from "../../../repositories/interface/data-event-repository-interface";
import { UpdateOverNigthDateEventSchema } from "../../../zod/dataEvent/update-overnigth-date-event-params-schema";
import { NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";

class UpdateOvernigthDateEventUseCase {
    constructor(
        private historyRepository: HistoryRepositoryInterface,
        private dateEventRepository: DateEventRepositoryInterface,
        private notificationRepository: NotificationRepositoryInterface,
    ) { }

    async execute(params: UpdateOverNigthDateEventSchema) {
        console.log("usecase")
        const { userId, username, dateEventId,proposalId,venueId, data } = params
        const { startDay,endDay, endHour, startHour, ...rest } = data

        const { startDate } = transformDate({ date: startDay, endHour: endHour, startHour: startHour, divisor: "/" })
        const { endDate } = transformDate({ date: endDay, endHour: endHour, startHour: startHour, divisor: "/" })


        const isNotAvailable = await this.dateEventRepository.checkAvailability({
            venueId,
            endDate: startDate,
            startDate: endDate,
            dataeEventId: dateEventId
        });

        if (isNotAvailable) {
            throw new HttDateEventAvailableError();
        }
        

        const updateDateEvent = await this.dateEventRepository.update({
            dateEventId,
            data: {
                ...rest,
                endDate,
                startDate,
            }
        })


        if (!updateDateEvent) {
            throw new HttpConflictError("Data")
        }
        //

        if (updateDateEvent && proposalId) {

            const types = [
                { display: "visita", data: "VISIT" },
                { display: "evento", data: "EVENT" },
                { display: "horario", data: "OTHER" },
                { display: "permuta", data: "BARTER" },
                { display: "estadia", data: "OVERNIGHT" },
                { display: "producao", data: "PRODUCTION" },
            ]

            const typeNotification = types.find((item: { display: string, data: string }) => { return item.data === data.type })

            await this.historyRepository.create({
                userId: userId,
                proposalId: proposalId,
                action: `${username} atualizou este orcamento`,
            });

            await this.notificationRepository.create({
                proposalId: proposalId,
                type: updateDateEvent.type,
                dataEventId: updateDateEvent.id,
                venueId: updateDateEvent.venueId,
                content: `Um(a) ${typeNotification?.display} foi atualziada(a), para data  ${format(startDate, "dd/MM/yyyy")}`,
            });
        }


        if (updateDateEvent) {
            await this.notificationRepository.create({
                type: "OTHER",
                dataEventId: updateDateEvent.id,
                venueId: updateDateEvent.venueId,
                content: `${updateDateEvent.title} foi atualizada(a), para data ${format(startDate, "dd/MM/yyyy")}`,
            });
        }

        const formatedResponse = {
            success: true,
            message: "Data foi atualizada com sucesso",
            data: {
                ...updateDateEvent
            },
            count: 1,
            type: "DateEvent"
        }

        return formatedResponse 
    }
}

export { UpdateOvernigthDateEventUseCase }

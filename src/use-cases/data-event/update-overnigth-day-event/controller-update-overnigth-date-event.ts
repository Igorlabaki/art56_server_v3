import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { UpdateOvernigthDateEventUseCase } from "./use-case-update-overnigth-date-event";
import { updateOverNigthDateEventSchema } from "../../../zod/dataEvent/update-overnigth-date-event-params-schema";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { syncDateEventToGoogle, DateEventForSync } from "../../../services/google-calendar-sync-service";

class UpdateOverNigthDateEventController {
    constructor(private updateOverNigthDateEventUseCase: UpdateOvernigthDateEventUseCase) { }
    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const param = updateOverNigthDateEventSchema.parse(req.body);
            const response = await this.updateOverNigthDateEventUseCase.execute(param);
            const userId = req.user?.id;
            if (userId && response?.data) {
                await syncDateEventToGoogle(userId, response.data as DateEventForSync, "update");
            }
            return resp.json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateOverNigthDateEventController }

import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { UpdateSameDayDateEventUseCase } from "./use-case-update-same-day-date-event";
import { updateSameDayDateEventSchema } from "../../../zod/dataEvent/update-same-day-date-event-params-schema";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { syncDateEventToGoogle, DateEventForSync } from "../../../services/google-calendar-sync-service";

class UpdateSameDayDateEventController {
    constructor(private updateSameDayDateEventUseCase: UpdateSameDayDateEventUseCase) { }
    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const param = updateSameDayDateEventSchema.parse(req.body);
            const response = await this.updateSameDayDateEventUseCase.execute(param);
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

export { UpdateSameDayDateEventController }

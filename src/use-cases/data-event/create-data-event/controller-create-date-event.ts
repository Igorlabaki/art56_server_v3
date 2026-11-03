import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateDateEventUseCase } from "./use-case-create-date-event";
import { createSameDayDateEventRequestParmsSchema, CreateSameDayDateEventRequestParmsSchema } from "../../../zod/dataEvent/create-same-day-date-event-request-params-schema";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { syncDateEventToGoogle, DateEventForSync } from "../../../services/google-calendar-sync-service";

class CreateDateController {
    constructor(private createDateUseCase: CreateDateEventUseCase) { }

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body: CreateSameDayDateEventRequestParmsSchema = req.body;
            createSameDayDateEventRequestParmsSchema.parse(body);
            const response = await this.createDateUseCase.execute(body);
            const userId = req.user?.id;
            if (userId && response?.data) {
                await syncDateEventToGoogle(userId, response.data as DateEventForSync, "create");
            }
            return resp.status(201).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateDateController };
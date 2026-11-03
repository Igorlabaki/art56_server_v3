import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateOvernightDateEventUseCase } from "./use-case-create-overnigth-date-event";
import { createOvernigthDateEventRequestParmsSchema, CreateOvernigthDateEventRequestParmsSchema } from "../../../zod/dataEvent/create-overnithg-date-event-request-params-schema";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { syncDateEventToGoogle, DateEventForSync } from "../../../services/google-calendar-sync-service";

class CreateOvernightDateController {
    constructor(private createOvernightDateEventUseCase: CreateOvernightDateEventUseCase) { }

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body: CreateOvernigthDateEventRequestParmsSchema = req.body;
            createOvernigthDateEventRequestParmsSchema.parse(body);
            const response = await this.createOvernightDateEventUseCase.execute(body);
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

export { CreateOvernightDateController };
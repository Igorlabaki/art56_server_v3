import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { createVenueRuleSchema } from "../../../zod/venue-rule/create-venue-rule-schema";
import { CreateVenueRuleUseCase } from "./use-case-create-venue-rule";

class CreateVenueRuleController {
    constructor(private useCase: CreateVenueRuleUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body = createVenueRuleSchema.parse(req.body);
            const response = await this.useCase.execute(req.user?.id, body);
            return resp.status(201).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateVenueRuleController };

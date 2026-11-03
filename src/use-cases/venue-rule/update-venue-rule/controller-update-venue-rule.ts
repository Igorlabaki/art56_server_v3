import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { updateVenueRuleSchema } from "../../../zod/venue-rule/update-venue-rule-schema";
import { UpdateVenueRuleUseCase } from "./use-case-update-venue-rule";

class UpdateVenueRuleController {
    constructor(private useCase: UpdateVenueRuleUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body = updateVenueRuleSchema.parse(req.body);
            const response = await this.useCase.execute(req.user?.id, body);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateVenueRuleController };

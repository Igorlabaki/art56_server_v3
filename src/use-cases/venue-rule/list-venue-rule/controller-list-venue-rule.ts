import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { listVenueRuleParamSchema } from "../../../zod/venue-rule/list-venue-rule-param-schema";
import { ListVenueRuleUseCase } from "./use-case-list-venue-rule";

class ListVenueRuleController {
    constructor(private useCase: ListVenueRuleUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const { venueId } = listVenueRuleParamSchema.parse(req.params);
            const response = await this.useCase.execute(req.user?.id, venueId);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { ListVenueRuleController };

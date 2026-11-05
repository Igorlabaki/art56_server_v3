import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { listVenueRuleParamSchema } from "../../../zod/venue-rule/list-venue-rule-param-schema";
import { ListPublicVenueRuleUseCase } from "./use-case-list-public-venue-rule";

class ListPublicVenueRuleController {
    constructor(private useCase: ListPublicVenueRuleUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = listVenueRuleParamSchema.parse(req.params);
            const response = await this.useCase.execute(venueId);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { ListPublicVenueRuleController };

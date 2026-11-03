import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { deleteVenueRuleParamSchema } from "../../../zod/venue-rule/delete-venue-rule-param-schema";
import { DeleteVenueRuleUseCase } from "./use-case-delete-venue-rule";

class DeleteVenueRuleController {
    constructor(private useCase: DeleteVenueRuleUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const { ruleId } = deleteVenueRuleParamSchema.parse(req.params);
            const response = await this.useCase.execute(req.user?.id, ruleId);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteVenueRuleController };

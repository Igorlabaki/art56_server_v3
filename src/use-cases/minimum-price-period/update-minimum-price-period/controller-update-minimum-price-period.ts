import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { updateMinimumPricePeriodSchema } from "../../../zod/minimumPricePeriod/update-minimum-price-period-params-schema";
import { UpdateMinimumPricePeriodUseCase } from "./use-case-update-minimum-price-period";

class UpdateMinimumPricePeriodController {
    constructor(private useCase: UpdateMinimumPricePeriodUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body = updateMinimumPricePeriodSchema.parse(req.body);
            const response = await this.useCase.execute(req.user?.id, body);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateMinimumPricePeriodController };

import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { createMinimumPricePeriodSchema } from "../../../zod/minimumPricePeriod/create-minimum-price-period-params-schema";
import { CreateMinimumPricePeriodUseCase } from "./use-case-create-minimum-price-period";

class CreateMinimumPricePeriodController {
    constructor(private useCase: CreateMinimumPricePeriodUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body = createMinimumPricePeriodSchema.parse(req.body);
            const response = await this.useCase.execute(req.user?.id, body);
            return resp.status(201).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateMinimumPricePeriodController };

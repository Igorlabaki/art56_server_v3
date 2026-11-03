import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { listMinimumPricePeriodParamSchema } from "../../../zod/minimumPricePeriod/list-minimum-price-period-param-schema";
import { ListMinimumPricePeriodUseCase } from "./use-case-list-minimum-price-period";

class ListMinimumPricePeriodController {
    constructor(private useCase: ListMinimumPricePeriodUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const { venueId } = listMinimumPricePeriodParamSchema.parse(req.params);
            const response = await this.useCase.execute(req.user?.id, venueId);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { ListMinimumPricePeriodController };

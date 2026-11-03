import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { deleteMinimumPricePeriodParamSchema } from "../../../zod/minimumPricePeriod/delete-minimum-price-period-param-schema";
import { DeleteMinimumPricePeriodUseCase } from "./use-case-delete-minimum-price-period";

class DeleteMinimumPricePeriodController {
    constructor(private useCase: DeleteMinimumPricePeriodUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const { id } = deleteMinimumPricePeriodParamSchema.parse(req.params);
            const response = await this.useCase.execute(req.user?.id, id);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteMinimumPricePeriodController };

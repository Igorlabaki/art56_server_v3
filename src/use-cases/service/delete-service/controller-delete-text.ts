import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { deleteServiceRequestParamSchema } from "../../../zod/services/delete-service-param-schema";
import { DeleteServiceUseCase } from "./use-case-delete-service";

class DeleteServiceController {
    constructor(private deleteServiceUseCase: DeleteServiceUseCase) { }

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const param = deleteServiceRequestParamSchema.parse(req.params);
            const response = await this.deleteServiceUseCase.execute(req.user?.id, param);
            return resp.json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteServiceController };

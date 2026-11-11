import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { ReportParams, reportParamsSchema } from "../../../zod/venue/report-params-schema";

interface ReportUseCase {
    execute(userId: string | undefined, params: ReportParams): Promise<unknown>;
}

class ReportController {
    constructor(private useCase: ReportUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const params = reportParamsSchema.parse(req.query);
            const response = await this.useCase.execute(req.user?.id, params);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { ReportController };

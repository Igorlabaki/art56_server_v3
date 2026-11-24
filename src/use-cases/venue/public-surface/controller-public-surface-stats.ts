import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { getVenuePresentationParamSchema } from "../../../zod/venue/get-venue-presentation-param-schema";
import { publicSurfaceStatsQuerySchema } from "../../../zod/venue/public-surface-stats-schema";
import { GetPublicSurfaceStatsUseCase } from "./use-case-public-surface-stats";

class GetPublicSurfaceStatsController {
    constructor(private readonly useCase: GetPublicSurfaceStatsUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const { month } = publicSurfaceStatsQuerySchema.parse(req.query);
            const response = await this.useCase.execute((req as AuthenticatedRequest).user?.id ?? null, venueId, month);
            resp.set("Cache-Control", "private, no-store");
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetPublicSurfaceStatsController };

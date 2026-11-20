import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { reorderProposalImagesSchema } from "../../../zod/proposal/reorder-proposal-images-schema";
import { getVenuePresentationParamSchema } from "../../../zod/venue/get-venue-presentation-param-schema";
import { ReorderVenueImagesUseCase } from "./use-case-reorder-venue-images";

class ReorderVenueImagesController {
    constructor(private useCase: ReorderVenueImagesUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const body = reorderProposalImagesSchema.parse(req.body);
            const result = await this.useCase.execute({
                venueKey: venueId,
                imageIds: body.imageIds,
                userId: (req as AuthenticatedRequest).user?.id ?? null,
            });
            return resp.status(200).json(result);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { ReorderVenueImagesController };

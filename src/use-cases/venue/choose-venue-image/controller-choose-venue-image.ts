import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { chooseProposalImageSchema } from "../../../zod/proposal/choose-proposal-image-schema";
import { getVenuePresentationParamSchema } from "../../../zod/venue/get-venue-presentation-param-schema";
import { ChooseVenueImageUseCase } from "./use-case-choose-venue-image";

class ChooseVenueImageController {
    constructor(private useCase: ChooseVenueImageUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const body = chooseProposalImageSchema.parse(req.body);
            const result = await this.useCase.execute({
                venueKey: venueId,
                slotId: body.slotId,
                replacementId: body.replacementId,
                userId: (req as AuthenticatedRequest).user?.id ?? null,
            });
            return resp.status(200).json(result);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { ChooseVenueImageController };

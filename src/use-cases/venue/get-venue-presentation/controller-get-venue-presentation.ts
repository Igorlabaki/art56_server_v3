import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { readOptionalUserId } from "../../../middleware/ensureAuthenticate";
import { getVenuePresentationParamSchema } from "../../../zod/venue/get-venue-presentation-param-schema";
import { GetVenuePresentationUseCase } from "./use-case-get-venue-presentation";

class GetVenuePresentationController {
    constructor(private useCase: GetVenuePresentationUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const response = await this.useCase.execute(venueId, readOptionalUserId(req));
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetVenuePresentationController };

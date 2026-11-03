import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { updateVenueAmenitySchema } from "../../../zod/venue-amenity/update-venue-amenity-schema";
import { UpdateVenueAmenityUseCase } from "./use-case-update-venue-amenity";

class UpdateVenueAmenityController {
    constructor(private useCase: UpdateVenueAmenityUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body = updateVenueAmenitySchema.parse(req.body);
            const response = await this.useCase.execute(req.user?.id, body);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateVenueAmenityController };

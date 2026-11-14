import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { readMultipartPayload } from "../../../functions/read-multipart-payload";
import { amenityRequestFiles } from "../../../functions/venue-amenity-upload";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { updateVenueAmenitySchema } from "../../../zod/venue-amenity/update-venue-amenity-schema";
import { UpdateVenueAmenityUseCase } from "./use-case-update-venue-amenity";

class UpdateVenueAmenityController {
    constructor(private useCase: UpdateVenueAmenityUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body = updateVenueAmenitySchema.parse(readMultipartPayload(req.body));
            const response = await this.useCase.execute(req.user?.id, body, amenityRequestFiles(req));
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateVenueAmenityController };

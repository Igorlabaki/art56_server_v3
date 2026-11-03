import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { deleteVenueAmenityParamSchema } from "../../../zod/venue-amenity/delete-venue-amenity-param-schema";
import { DeleteVenueAmenityUseCase } from "./use-case-delete-venue-amenity";

class DeleteVenueAmenityController {
    constructor(private useCase: DeleteVenueAmenityUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const { amenityId } = deleteVenueAmenityParamSchema.parse(req.params);
            const response = await this.useCase.execute(req.user?.id, amenityId);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteVenueAmenityController };

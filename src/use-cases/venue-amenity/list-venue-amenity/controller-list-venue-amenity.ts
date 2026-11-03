import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { listVenueAmenityParamSchema } from "../../../zod/venue-amenity/list-venue-amenity-param-schema";
import { ListVenueAmenityUseCase } from "./use-case-list-venue-amenity";

class ListVenueAmenityController {
    constructor(private useCase: ListVenueAmenityUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const { venueId } = listVenueAmenityParamSchema.parse(req.params);
            const response = await this.useCase.execute(req.user?.id, venueId);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { ListVenueAmenityController };

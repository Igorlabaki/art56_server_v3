import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { readMultipartPayload } from "../../../functions/read-multipart-payload";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { createVenueAmenitySchema } from "../../../zod/venue-amenity/create-venue-amenity-schema";
import { CreateVenueAmenityUseCase } from "./use-case-create-venue-amenity";

class CreateVenueAmenityController {
    constructor(private useCase: CreateVenueAmenityUseCase) {}

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body = createVenueAmenitySchema.parse(readMultipartPayload(req.body));
            const response = await this.useCase.execute(req.user?.id, body, req.file);
            return resp.status(201).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateVenueAmenityController };

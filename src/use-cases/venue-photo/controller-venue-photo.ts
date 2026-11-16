import { Response } from "express";
import { handleErrors } from "../../errors/error-handler";
import { venuePhotoRequestFiles } from "../../functions/venue-photo-image";
import { AuthenticatedRequest } from "../../types/authenticated-request";
import { updateVenuePhotoSchema, venuePhotoIdSchema, venuePhotoVenueIdSchema } from "../../zod/venue-photo/venue-photo-schema";
import { VenuePhotoInUseError } from "./venue-photo-in-use-error";
import { VenuePhotoUseCase } from "./use-case-venue-photo";

export class VenuePhotoController {
    constructor(private useCase: VenuePhotoUseCase) {}

    async list(req: AuthenticatedRequest, res: Response) {
        try {
            const { venueId } = venuePhotoVenueIdSchema.parse(req.query);
            const response = await this.useCase.list(req.user?.id, venueId);
            return res.status(200).json(response);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async upload(req: AuthenticatedRequest, res: Response) {
        try {
            const { venueId } = venuePhotoVenueIdSchema.parse(req.body);
            const response = await this.useCase.upload(req.user?.id, venueId, venuePhotoRequestFiles(req));
            return res.status(201).json(response);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async update(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = venuePhotoIdSchema.parse(req.params);
            const { description } = updateVenuePhotoSchema.parse(req.body);
            const response = await this.useCase.updateDescription(req.user?.id, id, description);
            return res.status(200).json(response);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async usages(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = venuePhotoIdSchema.parse(req.params);
            const response = await this.useCase.usages(req.user?.id, id);
            return res.status(200).json(response);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    async delete(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = venuePhotoIdSchema.parse(req.params);
            const response = await this.useCase.delete(req.user?.id, id);
            return res.status(200).json(response);
        } catch (error) {
            return this.fail(res, error);
        }
    }

    private fail(res: Response, error: unknown) {
        if (error instanceof VenuePhotoInUseError) {
            return res.status(409).json({
                title: error.name,
                message: error.message,
                data: error.usages,
            });
        }
        const errorResponse = handleErrors(error);
        return res.status(errorResponse.statusCode).json(errorResponse.body);
    }
}

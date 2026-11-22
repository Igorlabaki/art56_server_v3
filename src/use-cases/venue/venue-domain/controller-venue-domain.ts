import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { getVenuePresentationParamSchema } from "../../../zod/venue/get-venue-presentation-param-schema";
import { saveVenueDomainBodySchema } from "../../../zod/venue/save-venue-domain-schema";
import { DeleteVenueDomainUseCase, GetVenueDomainUseCase, ResolveVenueDomainUseCase, SaveVenueDomainUseCase, VerifyVenueDomainUseCase } from "./use-case-venue-domain";

class ResolveVenueDomainController {
    constructor(private readonly useCase: ResolveVenueDomainUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const host = req.query.host;
            const value = Array.isArray(host) ? host[0] : host;
            if (typeof value !== "string" || !value.trim()) throw new HttpResourceNotFoundError("Dominio");
            const response = await this.useCase.execute(value);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

class GetVenueDomainController {
    constructor(private readonly useCase: GetVenueDomainUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const response = await this.useCase.execute((req as AuthenticatedRequest).user.id, venueId);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

class SaveVenueDomainController {
    constructor(private readonly useCase: SaveVenueDomainUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const { hostname } = saveVenueDomainBodySchema.parse(req.body);
            const response = await this.useCase.execute((req as AuthenticatedRequest).user.id, venueId, hostname);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

class VerifyVenueDomainController {
    constructor(private readonly useCase: VerifyVenueDomainUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const response = await this.useCase.execute((req as AuthenticatedRequest).user.id, venueId);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

class DeleteVenueDomainController {
    constructor(private readonly useCase: DeleteVenueDomainUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const response = await this.useCase.execute((req as AuthenticatedRequest).user.id, venueId);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteVenueDomainController, GetVenueDomainController, ResolveVenueDomainController, SaveVenueDomainController, VerifyVenueDomainController };

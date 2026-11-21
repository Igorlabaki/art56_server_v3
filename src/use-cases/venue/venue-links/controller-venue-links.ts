import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { readOptionalUserId } from "../../../middleware/ensureAuthenticate";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { getVenuePresentationParamSchema } from "../../../zod/venue/get-venue-presentation-param-schema";
import { createVenueLinkBodySchema, hideVenueLinkBodySchema, orderVenueLinksBodySchema, saveVenueLinksBodySchema, setVenueLinkVisibleBodySchema } from "../../../zod/venue/save-venue-links-schema";
import { CreateVenueLinkUseCase, GetVenueLinkEditorUseCase, GetVenueLinksUseCase, HideVenueLinkUseCase, OrderVenueLinksUseCase, SaveVenueLinksUseCase, SetVenueLinkVisibleUseCase } from "./use-case-venue-links";

class GetVenueLinksController {
    constructor(private readonly useCase: GetVenueLinksUseCase) {}

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

class GetVenueLinkEditorController {
    constructor(private readonly useCase: GetVenueLinkEditorUseCase) {}

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

class SaveVenueLinksController {
    constructor(private readonly useCase: SaveVenueLinksUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const { links } = saveVenueLinksBodySchema.parse(req.body);
            const response = await this.useCase.execute(
                (req as AuthenticatedRequest).user.id,
                venueId,
                links.map((link) => ({ ...link, url: link.url ?? null })),
            );
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

class OrderVenueLinksController {
    constructor(private readonly useCase: OrderVenueLinksUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const { kinds } = orderVenueLinksBodySchema.parse(req.body);
            const response = await this.useCase.execute((req as AuthenticatedRequest).user?.id ?? null, venueId, kinds);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

class CreateVenueLinkController {
    constructor(private readonly useCase: CreateVenueLinkUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const { kind, url, visible } = createVenueLinkBodySchema.parse(req.body);
            const response = await this.useCase.execute((req as AuthenticatedRequest).user?.id ?? null, venueId, kind, url ?? null, visible ?? true);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

class HideVenueLinkController {
    constructor(private readonly useCase: HideVenueLinkUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const { kind } = hideVenueLinkBodySchema.parse(req.body);
            const response = await this.useCase.execute((req as AuthenticatedRequest).user?.id ?? null, venueId, kind);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

class SetVenueLinkVisibleController {
    constructor(private readonly useCase: SetVenueLinkVisibleUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const { kind, visible } = setVenueLinkVisibleBodySchema.parse(req.body);
            const response = await this.useCase.execute((req as AuthenticatedRequest).user?.id ?? null, venueId, kind, visible);
            return resp.status(200).json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateVenueLinkController, GetVenueLinkEditorController, GetVenueLinksController, HideVenueLinkController, OrderVenueLinksController, SaveVenueLinksController, SetVenueLinkVisibleController };

import { Request, Response, Router, text } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { getVenuePresentationParamSchema } from "../../../zod/venue/get-venue-presentation-param-schema";
import { RecordPublicSurfaceClickUseCase, RecordPublicSurfaceViewUseCase } from "./use-case-record-public-surface";

export function requestOriginKey(req: Request) {
    const origin = req.get("origin")?.trim();
    if (origin) return `origin:${origin}`;
    const address = req.ip || req.socket?.remoteAddress;
    return address ? `ip:${address}` : "unknown";
}

export function readBeaconPayload(body: unknown) {
    if (typeof body !== "string") return body;
    if (body.length > 1024) return null;
    try {
        return JSON.parse(body) as unknown;
    } catch {
        return null;
    }
}

class RecordPublicSurfaceViewController {
    constructor(private readonly useCase: RecordPublicSurfaceViewUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const payload = readBeaconPayload(req.body);
            if (payload === null) return resp.status(400).end();
            const status = await this.useCase.execute(venueId, payload, requestOriginKey(req));
            if (status === "limited") return resp.status(429).end();
            if (status === "invalid") return resp.status(400).end();
            if (status === "missing") return resp.status(404).end();
            if (status === "failed") return resp.status(500).end();
            return resp.status(204).end();
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).end();
        }
    }
}

class RecordPublicSurfaceClickController {
    constructor(private readonly useCase: RecordPublicSurfaceClickUseCase) {}

    async handle(req: Request, resp: Response) {
        try {
            const { venueId } = getVenuePresentationParamSchema.parse(req.params);
            const kind = typeof req.params.kind === "string" ? req.params.kind : "";
            const result = await this.useCase.execute(venueId, kind);
            if (result.status === "missing") return resp.status(404).end();
            resp.set("Cache-Control", "no-store");
            return resp.redirect(302, result.href);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).end();
        }
    }
}

export function mountPublicSurfaceCollection(
    router: Router,
    view: () => RecordPublicSurfaceViewController,
    click: () => RecordPublicSurfaceClickController,
) {
    router.post("/links/:venueId/view", text({ type: "*/*", limit: "1kb" }), async (req, res) => {
        await view().handle(req, res);
    });
    router.get("/links/:venueId/go/:kind", async (req, res) => {
        await click().handle(req, res);
    });
}

export { RecordPublicSurfaceClickController, RecordPublicSurfaceViewController };

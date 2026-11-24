import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { OriginLimiter } from "../../../functions/public-surface-limit";
import { VENUE_LINK_KINDS, VenueLinkKind } from "../../../functions/venue-link";
import { PublicSurfaceStore } from "../../../repositories/interface/public-surface-store";
import { VenueLinkRepository } from "../../../repositories/interface/venue-link-repository-interface";
import { publicSurfaceViewBodySchema } from "../../../zod/venue/public-surface-view-schema";
import { GetVenueLinksUseCase } from "../venue-links/use-case-venue-links";

type ViewStatus = "accepted" | "limited" | "invalid" | "missing" | "failed";

class RecordPublicSurfaceViewUseCase {
    constructor(
        private readonly links: Pick<VenueLinkRepository, "findByKey">,
        private readonly surfaces: Pick<PublicSurfaceStore, "recordOpen">,
        private readonly limiter: OriginLimiter,
        private readonly now: () => Date = () => new Date(),
    ) {}

    async execute(venueKey: string, body: unknown, originKey: string): Promise<ViewStatus> {
        if (!this.limiter.allow(originKey)) return "limited";
        const parsed = publicSurfaceViewBodySchema.safeParse(body);
        if (!parsed.success) return "invalid";
        const venue = await this.links.findByKey(venueKey);
        if (!venue) return "missing";
        try {
            await this.surfaces.recordOpen({
                venueId: venue.id,
                at: this.now(),
                surface: parsed.data.surface,
                visitorId: parsed.data.surface === "LINKS" ? parsed.data.visitorKey ?? null : null,
            });
        } catch {
            return "failed";
        }
        return "accepted";
    }
}

type ClickResult = { status: "redirect"; href: string } | { status: "missing" };

class RecordPublicSurfaceClickUseCase {
    constructor(
        private readonly read: Pick<GetVenueLinksUseCase, "execute">,
        private readonly links: Pick<VenueLinkRepository, "findByKey">,
        private readonly surfaces: Pick<PublicSurfaceStore, "recordClick">,
        private readonly now: () => Date = () => new Date(),
        private readonly log: (message: string) => void = (message) => console.error(message),
    ) {}

    async execute(venueKey: string, kind: string): Promise<ClickResult> {
        if (!(VENUE_LINK_KINDS as readonly string[]).includes(kind)) return { status: "missing" };
        let href: string | undefined;
        try {
            const page = await this.read.execute(venueKey, null);
            href = page.data.links.find((link) => link.kind === kind)?.href;
        } catch (error) {
            if (error instanceof HttpResourceNotFoundError) return { status: "missing" };
            throw error;
        }
        if (!href) return { status: "missing" };
        const venue = await this.links.findByKey(venueKey);
        if (!venue) return { status: "missing" };
        try {
            await this.surfaces.recordClick({ venueId: venue.id, at: this.now(), kind: kind as VenueLinkKind });
        } catch {
            this.log("[public-surface] clique nao gravado");
        }
        return { status: "redirect", href };
    }
}

export { RecordPublicSurfaceClickUseCase, RecordPublicSurfaceViewUseCase };

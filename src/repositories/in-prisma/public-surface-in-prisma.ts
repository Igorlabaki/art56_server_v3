import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import { isSiteCreationAction, hashVisitorKey, saoPauloCalendar, SITE_CREATION_ACTIONS } from "../../functions/public-surface";
import {
    PublicSurfaceStore,
    SurfaceClick,
    SurfaceOpen,
    SurfaceSummary,
    SurfaceSummaryQuery,
} from "../interface/public-surface-store";

export class PrismaPublicSurfaceStore implements PublicSurfaceStore {
    constructor(private readonly prisma: PrismaClient) {}

    async recordOpen(input: SurfaceOpen) {
        const { day, month } = saoPauloCalendar(input.at);
        await this.increment(input.venueId, day, input.surface, 1, 0);
        if (input.surface !== "LINKS") return;
        const visitorKey = hashVisitorKey(input.visitorId);
        if (!visitorKey) return;
        await this.prisma.$executeRaw`
            INSERT INTO public_surface_visitor (id, venueId, month, surface, visitorKey)
            VALUES (${randomUUID()}, ${input.venueId}, ${month}, ${"LINKS"}, ${visitorKey})
            ON DUPLICATE KEY UPDATE id = id
        `;
    }

    async recordClick(input: SurfaceClick) {
        const { day } = saoPauloCalendar(input.at);
        await this.increment(input.venueId, day, input.kind, 0, 1);
    }

    async summarize(query: SurfaceSummaryQuery): Promise<SurfaceSummary> {
        const rows = await this.prisma.publicSurfaceDaily.findMany({
            where: {
                venueId: query.venueId,
                day: { gte: new Date(`${query.dayFrom}T00:00:00.000Z`), lt: new Date(`${query.dayTo}T00:00:00.000Z`) },
            },
            select: { subject: true, opens: true, clicks: true },
        });
        let linksOpens = 0;
        let formOpens = 0;
        const clicksByKind: Record<string, number> = {};
        for (const row of rows) {
            if (row.subject === "LINKS") linksOpens += row.opens;
            else if (row.subject === "FORM") formOpens += row.opens;
            else clicksByKind[row.subject] = (clicksByKind[row.subject] ?? 0) + row.clicks;
        }
        const linksPeople = await this.prisma.publicSurfaceVisitor.count({
            where: { venueId: query.venueId, month: query.month, surface: "LINKS" },
        });
        const proposals = await this.prisma.proposal.findMany({
            where: {
                venueId: query.venueId,
                histories: {
                    some: {
                        action: { in: [...SITE_CREATION_ACTIONS] },
                        createdAt: { gte: query.historyFrom, lt: query.historyTo },
                    },
                },
            },
            select: { id: true },
        });
        return {
            linksOpens,
            linksPeople,
            clicksByKind,
            formOpens,
            proposalsCreated: proposals.length,
        };
    }

    private increment(venueId: string, day: string, subject: string, opens: number, clicks: number) {
        return this.prisma.$executeRaw`
            INSERT INTO public_surface_daily (id, venueId, day, subject, opens, clicks)
            VALUES (${randomUUID()}, ${venueId}, ${day}, ${subject}, ${opens}, ${clicks})
            ON DUPLICATE KEY UPDATE
                opens = opens + ${opens},
                clicks = clicks + ${clicks}
        `;
    }
}

export { isSiteCreationAction };

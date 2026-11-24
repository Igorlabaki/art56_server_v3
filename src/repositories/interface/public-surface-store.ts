import { randomUUID } from "crypto";
import {
    hashVisitorKey,
    isSiteCreationAction,
    saoPauloCalendar,
    type PublicSurfaceName,
} from "../../functions/public-surface";

export type SurfaceOpen = {
    venueId: string;
    at: Date;
    surface: PublicSurfaceName;
    visitorId?: string | null;
};

export type SurfaceClick = {
    venueId: string;
    at: Date;
    kind: string;
};

export type SurfaceProposal = {
    id: string;
    venueId: string;
    histories: { action: string; createdAt: Date }[];
};

export type SurfaceSummaryQuery = {
    venueId: string;
    month: string;
    dayFrom: string;
    dayTo: string;
    historyFrom: Date;
    historyTo: Date;
};

export type SurfaceSummary = {
    linksOpens: number;
    linksPeople: number;
    clicksByKind: Record<string, number>;
    formOpens: number;
    proposalsCreated: number;
};

export interface PublicSurfaceStore {
    recordOpen(input: SurfaceOpen): Promise<void>;
    recordClick(input: SurfaceClick): Promise<void>;
    summarize(query: SurfaceSummaryQuery): Promise<SurfaceSummary>;
}

type DailyRow = { venueId: string; day: string; subject: string; opens: number; clicks: number };

function dayInRange(day: string, from: string, to: string) {
    return day >= from && day < to;
}

export class MemoryPublicSurfaceStore implements PublicSurfaceStore {
    private readonly daily = new Map<string, DailyRow>();
    private readonly visitors = new Set<string>();
    private readonly proposals: SurfaceProposal[] = [];
    private chain: Promise<void> = Promise.resolve();

    addProposal(proposal: SurfaceProposal) {
        this.proposals.push(proposal);
    }

    async recordOpen(input: SurfaceOpen) {
        return this.exclusive(async () => {
            const { day, month } = saoPauloCalendar(input.at);
            this.add(input.venueId, day, input.surface, 1, 0);
            if (input.surface !== "LINKS") return;
            const visitorKey = hashVisitorKey(input.visitorId);
            if (!visitorKey) return;
            this.visitors.add(`${input.venueId}|${month}|LINKS|${visitorKey}`);
        });
    }

    async recordClick(input: SurfaceClick) {
        return this.exclusive(async () => {
            const { day } = saoPauloCalendar(input.at);
            this.add(input.venueId, day, input.kind, 0, 1);
        });
    }

    async summarize(query: SurfaceSummaryQuery): Promise<SurfaceSummary> {
        let linksOpens = 0;
        let formOpens = 0;
        const clicksByKind: Record<string, number> = {};
        for (const row of this.daily.values()) {
            if (row.venueId !== query.venueId || !dayInRange(row.day, query.dayFrom, query.dayTo)) continue;
            if (row.subject === "LINKS") linksOpens += row.opens;
            else if (row.subject === "FORM") formOpens += row.opens;
            else clicksByKind[row.subject] = (clicksByKind[row.subject] ?? 0) + row.clicks;
        }
        let linksPeople = 0;
        const prefix = `${query.venueId}|${query.month}|LINKS|`;
        for (const key of this.visitors) {
            if (key.startsWith(prefix)) linksPeople += 1;
        }
        const proposalsCreated = this.proposals.filter((proposal) => {
            if (proposal.venueId !== query.venueId) return false;
            return proposal.histories.some((history) => (
                isSiteCreationAction(history.action)
                && history.createdAt >= query.historyFrom
                && history.createdAt < query.historyTo
            ));
        }).length;
        return { linksOpens, linksPeople, clicksByKind, formOpens, proposalsCreated };
    }

    private add(venueId: string, day: string, subject: string, opens: number, clicks: number) {
        const key = `${venueId}|${day}|${subject}`;
        const row = this.daily.get(key) ?? { venueId, day, subject, opens: 0, clicks: 0 };
        row.opens += opens;
        row.clicks += clicks;
        this.daily.set(key, row);
    }

    private exclusive<T>(work: () => Promise<T>) {
        const run = this.chain.then(work, work);
        this.chain = run.then(() => undefined, () => undefined);
        return run;
    }
}

export function newSurfaceId() {
    return randomUUID();
}

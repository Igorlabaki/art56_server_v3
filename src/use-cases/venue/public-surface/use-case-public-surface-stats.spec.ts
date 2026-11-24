import { describe, expect, it } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { DAILY_INCREMENT_SQL, formRate, monthWindow, PUBLIC_SURFACE_ACTIVATED_AT, saoPauloCalendar, VISITOR_INSERT_SQL } from "../../../functions/public-surface";
import { VenueLinkRecord, VenueLinkRepository } from "../../../repositories/interface/venue-link-repository-interface";
import { MemoryPublicSurfaceStore } from "../../../repositories/interface/public-surface-store";
import { VenueSiteViewPermission } from "../../../repositories/in-prisma/venue-site-view-permission-in-prisma";
import { venueRoutes } from "../../../router/venue";
import { GetPublicSurfaceStatsUseCase } from "./use-case-public-surface-stats";

const ACTIVATED = new Date("2026-11-15T17:00:00.000Z");
const VISITOR = "11111111-1111-4111-8111-111111111111";
const SAME_VISITOR = "11111111-1111-4111-8111-111111111111";

const allowOwner: VenueSiteViewPermission = {
    canViewVenueSites: async (userId, venueId) => userId === "owner" && venueId === "venue-1",
};

function linksOf(found: { id: string } | null): Pick<VenueLinkRepository, "findByKey"> {
    return { findByKey: async () => found as VenueLinkRecord | null };
}

function statsOf(store: MemoryPublicSurfaceStore, found: { id: string } | null = { id: "venue-1" }) {
    return new GetPublicSurfaceStatsUseCase(linksOf(found), allowOwner, store, ACTIVATED);
}

describe("janela de Sao Paulo", () => {
    it("vira o dia e o mes as 00:00", () => {
        expect(saoPauloCalendar(new Date("2026-12-01T02:59:59.000Z"))).toEqual({
            day: "2026-11-30",
            month: "2026-11",
        });
        expect(saoPauloCalendar(new Date("2026-12-01T03:00:00.000Z"))).toEqual({
            day: "2026-12-01",
            month: "2026-12",
        });
        const november = monthWindow("2026-11", ACTIVATED);
        const december = monthWindow("2026-12", ACTIVATED);
        expect(november?.dataSince).toBe("2026-11-15");
        expect(november?.historyFrom.toISOString()).toBe(ACTIVATED.toISOString());
        expect(december?.dataSince).toBeNull();
        expect(december?.historyFrom.toISOString()).toBe("2026-12-01T03:00:00.000Z");
        expect(december?.historyTo.toISOString()).toBe("2027-01-01T03:00:00.000Z");
    });

    it("deixa a taxa em branco quando o formulario nao abriu", () => {
        expect(formRate(8, 0)).toBeNull();
        expect(formRate(8, 35)).toBeCloseTo(8 / 35);
    });

    it("parte os orcamentos do instante gravado na main", () => {
        expect(PUBLIC_SURFACE_ACTIVATED_AT?.toISOString()).toBe("2026-11-24T01:31:37.000Z");
        const november = monthWindow("2026-11");
        expect(november?.historyFrom.toISOString()).toBe("2026-11-24T01:31:37.000Z");
        expect(november?.historyTo.toISOString()).toBe("2026-12-01T03:00:00.000Z");
        expect(november?.dataSince).toBe("2026-11-23");
    });
});

describe("agregacao e autorizacao", () => {
    it("conta duas aberturas concorrentes como uma pessoa e separa o mes", async () => {
        const store = new MemoryPublicSurfaceStore();
        const open = {
            venueId: "venue-1",
            at: new Date("2026-11-20T15:00:00.000Z"),
            surface: "LINKS" as const,
            visitorId: VISITOR,
        };
        await Promise.all([
            store.recordOpen(open),
            store.recordOpen({ ...open, visitorId: SAME_VISITOR.toUpperCase() }),
        ]);
        await store.recordOpen({ ...open, visitorId: "nao-e-uuid" });
        await store.recordOpen({
            venueId: "venue-1",
            at: new Date("2026-12-01T03:00:00.000Z"),
            surface: "LINKS",
            visitorId: VISITOR,
        });
        await store.recordOpen({
            venueId: "venue-1",
            at: new Date("2026-11-20T18:00:00.000Z"),
            surface: "FORM",
            visitorId: VISITOR,
        });
        await store.recordClick({ venueId: "venue-1", at: new Date("2026-11-20T18:00:00.000Z"), kind: "BUDGET_FORM" });
        store.addProposal({
            id: "proposal-1",
            venueId: "venue-1",
            histories: [
                { action: "Cliente criou este orçamento pelo site", createdAt: new Date("2026-11-16T12:00:00.000Z") },
                { action: "Cliente criou este orçamento pelo site", createdAt: new Date("2026-11-17T12:00:00.000Z") },
            ],
        });
        store.addProposal({
            id: "proposal-team",
            venueId: "venue-1",
            histories: [{ action: "Ana criou este orcamento", createdAt: new Date("2026-11-16T12:00:00.000Z") }],
        });
        store.addProposal({
            id: "proposal-before",
            venueId: "venue-1",
            histories: [{ action: "Cliente criou este orcamento pelo site", createdAt: new Date("2026-11-15T16:59:59.999Z") }],
        });
        store.addProposal({
            id: "proposal-other",
            venueId: "venue-2",
            histories: [{ action: "Cliente criou este orçamento pelo site", createdAt: new Date("2026-11-16T12:00:00.000Z") }],
        });
        store.addProposal({
            id: "proposal-accentless",
            venueId: "venue-1",
            histories: [{ action: "Cliente criou este orcamento pelo site", createdAt: ACTIVATED }],
        });

        const november = await statsOf(store).execute("owner", "AR756", "2026-11");
        expect(november.data.linksOpens).toBe(3);
        expect(november.data.linksPeople).toBe(1);
        expect(november.data.formOpens).toBe(1);
        expect(november.data.clicksByKind).toEqual({ BUDGET_FORM: 1 });
        expect(november.data.proposalsCreated).toBe(2);
        expect(november.data.formRate).toBe(2);
        expect(november.data.dataSince).toBe("2026-11-15");

        const december = await statsOf(store).execute("owner", "AR756", "2026-12");
        expect(december.data.linksOpens).toBe(1);
        expect(december.data.linksPeople).toBe(1);
        expect(december.data.proposalsCreated).toBe(0);
        expect(december.data.dataSince).toBeNull();
        expect(december.data.formRate).toBeNull();
    });

    it("rejeita anonimo, outro espaco, casa ausente e mes invalido", async () => {
        const store = new MemoryPublicSurfaceStore();
        const useCase = statsOf(store);
        await expect(useCase.execute(null, "AR756", "2026-11")).rejects.toBeInstanceOf(HttpTokenError);
        await expect(useCase.execute("stranger", "AR756", "2026-11")).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(statsOf(store, null).execute("owner", "ausente", "2026-11")).rejects.toBeInstanceOf(HttpResourceNotFoundError);
        await expect(useCase.execute("owner", "AR756", "2026-13")).rejects.toBeInstanceOf(HttpBadRequestError);
    });

    it("exige autenticacao na rota e incremento atomico no SQL", () => {
        const layer = (venueRoutes as unknown as {
            stack: { route?: { path: string; methods?: Record<string, boolean>; stack: { name: string; handle?: { name?: string } }[] } }[];
        }).stack.find((item) => item.route?.path === "/links/:venueId/stats" && item.route.methods?.get);
        const names = layer?.route?.stack.map((entry) => entry.handle?.name || entry.name) ?? [];
        expect(names).toContain("ensureAuthenticate");
        expect(DAILY_INCREMENT_SQL).toContain("ON DUPLICATE KEY UPDATE");
        expect(VISITOR_INSERT_SQL).toContain("ON DUPLICATE KEY UPDATE id = id");
        expect(DAILY_INCREMENT_SQL).not.toContain("ip");
        expect(VISITOR_INSERT_SQL).not.toContain("email");
    });
});

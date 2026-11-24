import { createServer, Server } from "http";
import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createOriginLimiter } from "../../../functions/public-surface-limit";
import { VenueLinkRow } from "../../../functions/venue-link";
import { VenueLinkRecord, VenueLinkRepository } from "../../../repositories/interface/venue-link-repository-interface";
import { MemoryPublicSurfaceStore } from "../../../repositories/interface/public-surface-store";
import { venueRoutes } from "../../../router/venue";
import { monthWindow } from "../../../functions/public-surface";
import { mountPublicSurfaceCollection, RecordPublicSurfaceClickController, RecordPublicSurfaceViewController } from "./controller-record-public-surface";
import { RecordPublicSurfaceClickUseCase, RecordPublicSurfaceViewUseCase } from "./use-case-record-public-surface";
import { GetVenueLinksUseCase } from "../venue-links/use-case-venue-links";

const VISITOR = "11111111-1111-4111-8111-111111111111";

function record(): VenueLinkRecord {
    const links: VenueLinkRow[] = [
        { kind: "EMAIL", url: "created", visible: true, position: 0 },
        { kind: "WHATSAPP", url: "created", visible: true, position: 1 },
        { kind: "BUDGET_FORM", url: "created", visible: true, position: 2 },
        { kind: "INSTAGRAM", url: "https://www.instagram.com/ar756_/", visible: false, position: 3 },
    ];
    return {
        id: "venue-1",
        name: "AR756",
        logoUrl: null,
        slogan: null,
        proposalPrimaryColor: null,
        proposalSecondaryColor: null,
        proposalTextColor: null,
        url: null,
        instagramUrl: null,
        facebookUrl: null,
        tiktokUrl: null,
        whatsappNumber: "11999998888",
        email: "casa@example.com",
        tourVideoUrl: null,
        street: "Rua A",
        streetNumber: "10",
        neighborhood: "Centro",
        city: "Ubatuba",
        state: "SP",
        organizationUrl: null,
        links,
    };
}

function repository(found: VenueLinkRecord | null): VenueLinkRepository {
    return {
        findByKey: async (key) => (key === "ausente" ? null : found),
        replace: async () => undefined,
        insertMissing: async () => undefined,
        deleteKinds: async () => undefined,
    };
}

describe("rotas publicas de coleta", () => {
    const store = new MemoryPublicSurfaceStore();
    const links = repository(record());
    const read = new GetVenueLinksUseCase(links);
    const logs: string[] = [];
    const limiter = createOriginLimiter(1, 60_000);
    let server: Server;
    let base = "";

    beforeAll(async () => {
        const app = express();
        app.use(express.json());
        const view = new RecordPublicSurfaceViewUseCase(links, store, limiter, () => new Date("2026-11-20T15:00:00.000Z"));
        const click = new RecordPublicSurfaceClickUseCase(
            read,
            links,
            {
                recordClick: async (input) => {
                    if (input.kind === "WHATSAPP") throw new Error(`falha ${VISITOR} casa@example.com`);
                    await store.recordClick(input);
                },
            },
            () => new Date("2026-11-20T15:00:00.000Z"),
            (message) => logs.push(message),
        );
        mountPublicSurfaceCollection(
            app,
            () => new RecordPublicSurfaceViewController(view),
            () => new RecordPublicSurfaceClickController(click),
        );
        server = createServer(app);
        await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
        const address = server.address();
        if (!address || typeof address === "string") throw new Error("porta ausente");
        base = `http://127.0.0.1:${address.port}`;
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    });

    it("classifica 204, 400, 404 e 429 e nao ecoa a chave", async () => {
        const listed = await read.execute("AR756");
        expect(listed.data.links.map((link) => link.kind)).toEqual(["EMAIL", "WHATSAPP", "BUDGET_FORM"]);
        const before = await store.summarize(summary());
        expect(before.linksOpens).toBe(0);

        const accepted = await fetch(`${base}/links/AR756/view`, {
            method: "POST",
            headers: { origin: "https://casa.example", "content-type": "text/plain" },
            body: JSON.stringify({ surface: "LINKS", visitorKey: VISITOR }),
        });
        expect(accepted.status).toBe(204);
        expect(await accepted.text()).toBe("");

        const form = await fetch(`${base}/links/AR756/view`, {
            method: "POST",
            headers: { origin: "https://outra.example", "content-type": "application/json" },
            body: JSON.stringify({ surface: "FORM", visitorKey: VISITOR }),
        });
        expect(form.status).toBe(204);

        const invalid = await fetch(`${base}/links/AR756/view`, {
            method: "POST",
            headers: { origin: "https://invalida.example", "content-type": "text/plain" },
            body: "{",
        });
        expect(invalid.status).toBe(400);

        const missing = await fetch(`${base}/links/ausente/view`, {
            method: "POST",
            headers: { origin: "https://livre.example", "content-type": "text/plain" },
            body: JSON.stringify({ surface: "LINKS" }),
        });
        expect(missing.status).toBe(404);

        const limited = await fetch(`${base}/links/AR756/view`, {
            method: "POST",
            headers: { origin: "https://casa.example", "content-type": "text/plain" },
            body: JSON.stringify({ surface: "LINKS", visitorKey: VISITOR }),
        });
        expect(limited.status).toBe(429);

        const november = await store.summarize(summary());
        expect(november.linksOpens).toBe(1);
        expect(november.linksPeople).toBe(1);
        expect(november.formOpens).toBe(1);
    });

    it("redireciona o card visivel, responde 404 ao oculto e segue quando a gravacao falha", async () => {
        const page = await read.execute("AR756");
        const email = page.data.links.find((link) => link.kind === "EMAIL");
        const budget = page.data.links.find((link) => link.kind === "BUDGET_FORM");
        const whatsapp = page.data.links.find((link) => link.kind === "WHATSAPP");
        expect(email?.href).toBe("mailto:casa@example.com");
        expect(whatsapp?.href).toBe("https://wa.me/11999998888");
        expect(budget?.href).toContain("/espaco/AR756/formulario");

        const emailGo = await fetch(`${base}/links/AR756/go/EMAIL`, { redirect: "manual" });
        expect(emailGo.status).toBe(302);
        expect(emailGo.headers.get("location")).toBe(email?.href);
        expect(emailGo.headers.get("cache-control")).toBe("no-store");

        const budgetGo = await fetch(`${base}/links/AR756/go/BUDGET_FORM`, { redirect: "manual" });
        expect(budgetGo.status).toBe(302);
        expect(budgetGo.headers.get("location")).toBe(budget?.href);

        const hidden = await fetch(`${base}/links/AR756/go/INSTAGRAM`, { redirect: "manual" });
        expect(hidden.status).toBe(404);

        const unknown = await fetch(`${base}/links/AR756/go/NAO_EXISTE`, { redirect: "manual" });
        expect(unknown.status).toBe(404);

        const failed = await fetch(`${base}/links/AR756/go/WHATSAPP`, { redirect: "manual" });
        expect(failed.status).toBe(302);
        expect(failed.headers.get("location")).toBe(whatsapp?.href);
        expect(logs).toEqual(["[public-surface] clique nao gravado"]);
        expect(logs.join(" ")).not.toContain(VISITOR);
        expect(logs.join(" ")).not.toContain("casa@example.com");

        const november = await store.summarize(summary());
        expect(november.clicksByKind.EMAIL).toBe(1);
        expect(november.clicksByKind.BUDGET_FORM).toBe(1);
        expect(november.clicksByKind.INSTAGRAM).toBeUndefined();
        expect(november.clicksByKind.WHATSAPP).toBeUndefined();
    });

    it("deixa a coleta publica e a leitura de stats autenticada", () => {
        const names = (path: string, method: "get" | "post") => {
            const layer = (venueRoutes as unknown as {
                stack: { route?: { path: string; methods?: Record<string, boolean>; stack: { name: string; handle?: { name?: string } }[] } }[];
            }).stack.find((item) => item.route?.path === path && item.route.methods?.[method]);
            return layer?.route?.stack.map((entry) => entry.handle?.name || entry.name) ?? [];
        };
        expect(names("/links/:venueId/view", "post")).not.toContain("ensureAuthenticate");
        expect(names("/links/:venueId/go/:kind", "get")).not.toContain("ensureAuthenticate");
        expect(names("/links/:venueId", "get")).not.toContain("ensureAuthenticate");
        expect(names("/links/:venueId/stats", "get")).toContain("ensureAuthenticate");
        expect(names("/links/:venueId/view", "post").length).toBeGreaterThan(1);
    });
});

function summary() {
    const window = monthWindow("2026-11", new Date("2026-01-01T00:00:00.000Z"));
    if (!window) throw new Error("mes");
    return {
        venueId: "venue-1",
        month: window.month,
        dayFrom: window.dayFrom,
        dayTo: window.dayTo,
        historyFrom: window.historyFrom,
        historyTo: window.historyTo,
    };
}

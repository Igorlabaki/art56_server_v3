import { describe, expect, it } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { VenueLinkKind, VenueLinkRow } from "../../../functions/venue-link";
import { VenueInfoEditPermission, VenueLinkRecord, VenueLinkRepository } from "../../../repositories/interface/venue-link-repository-interface";
import { VenueSiteEditPermission } from "../../../repositories/interface/venue-site-edit-permission-interface";
import { venueRoutes } from "../../../router/venue";
import { CreateVenueLinkUseCase, GetVenueLinkEditorUseCase, GetVenueLinksUseCase, HideVenueLinkUseCase, OrderVenueLinksUseCase, SaveVenueLinksUseCase, SetVenueLinkVisibleUseCase } from "./use-case-venue-links";

const allow: VenueInfoEditPermission = { canEditVenueInfo: async () => true };
const deny: VenueInfoEditPermission = { canEditVenueInfo: async () => false };
const allowSite: VenueSiteEditPermission = { canEditVenueSite: async () => true };
const denySite: VenueSiteEditPermission = { canEditVenueSite: async () => false };

function record(links: VenueLinkRow[] = []): VenueLinkRecord {
    return {
        id: "venue-1",
        name: "AR756",
        logoUrl: "https://cdn.example/logo.png",
        slogan: "Casa",
        proposalPrimaryColor: "#111111",
        proposalSecondaryColor: "#ffffff",
        proposalTextColor: "#181818",
        url: null,
        instagramUrl: null,
        facebookUrl: null,
        tiktokUrl: null,
        whatsappNumber: "",
        email: null,
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

function store(found: VenueLinkRecord | null) {
    const replaced: { rows: VenueLinkRow[] }[] = [];
    const inserted: VenueLinkRow[][] = [];
    const removed: VenueLinkKind[][] = [];
    const links: VenueLinkRepository = {
        findByKey: async () => found,
        replace: async (_venueId, rows) => {
            replaced.push({ rows });
        },
        insertMissing: async (_venueId, rows) => {
            inserted.push(rows);
        },
        deleteKinds: async (_venueId, kinds) => {
            removed.push(kinds);
        },
    };
    return { links, replaced, inserted, removed };
}

function legacyColumns(found: VenueLinkRecord) {
    found.url = "https://www.ar756.com/";
    found.instagramUrl = "https://www.instagram.com/ar756_/";
    found.facebookUrl = "https://www.facebook.com/profile.php?id=100085832906065";
    found.tiktokUrl = "https://www.tiktok.com/@ar756_";
    return found;
}

function keysDeep(value: unknown): string[] {
    if (!value || typeof value !== "object") return [];
    if (Array.isArray(value)) return value.flatMap(keysDeep);
    return Object.entries(value).flatMap(([key, child]) => [key, ...keysDeep(child)]);
}

describe("leitura publica dos links", () => {
    it("lista vazia nao publica o conjunto padrao", async () => {
        const { links } = store(record());
        const response = await new GetVenueLinksUseCase(links).execute("AR756");
        expect(response.data.links).toEqual([]);
        expect(response.data.mapLabel).toBe("Centro — Ubatuba");
        expect(response.data.mapQuery).toBe("Rua A, 10, Centro, Ubatuba, SP");
        expect(response.data.tourVideoUrl).toBeNull();
        expect(response.data.canReorder).toBe(false);
        const keys = keysDeep(response.data);
        for (const hidden of ["email", "whatsappNumber", "street", "pricePerPerson", "ownerVenue", "contract"]) {
            expect(keys).not.toContain(hidden);
        }
    });

    it("video e mapa desligados somem do topo e do rodape", async () => {
        const found = record([
            { kind: "INSTAGRAM", url: "https://www.instagram.com/ar756_/", visible: true, position: 0 },
            { kind: "TOUR_VIDEO", url: "created", visible: false, position: 1 },
            { kind: "GOOGLE_MAPS", url: "created", visible: false, position: 2 },
        ]);
        found.tourVideoUrl = "https://www.youtube.com/watch?v=TfdZorJpR1I";
        const hidden = await new GetVenueLinksUseCase(store(found).links).execute("AR756");
        expect(hidden.data.tourVideoUrl).toBeNull();
        expect(hidden.data.mapQuery).toBeNull();
        expect(hidden.data.mapLabel).toBeNull();
        expect(hidden.data.links.map((link) => link.kind)).toEqual(["INSTAGRAM"]);
        found.links = found.links.map((row) => ({ ...row, visible: true }));
        const shown = await new GetVenueLinksUseCase(store(found).links).execute("AR756");
        expect(shown.data.tourVideoUrl).toBe("https://www.youtube.com/watch?v=TfdZorJpR1I");
        expect(shown.data.mapQuery).toBe("Rua A, 10, Centro, Ubatuba, SP");
        expect(shown.data.links.map((link) => link.kind)).toEqual(["INSTAGRAM", "TOUR_VIDEO", "GOOGLE_MAPS"]);
    });

    it("omite o link oculto e a casa inexistente", async () => {
        const hidden = record([{ kind: "INSTAGRAM", url: "https://www.instagram.com/ar756_/", visible: false, position: 0 }]);
        const response = await new GetVenueLinksUseCase(store(hidden).links).execute("AR756");
        expect(response.data.links.some((link) => link.kind === "INSTAGRAM")).toBe(false);
        expect(JSON.stringify(response.data)).not.toContain("instagram.com/ar756_");
        await expect(new GetVenueLinksUseCase(store(null).links).execute("nao-existe")).rejects.toBeInstanceOf(HttpResourceNotFoundError);
    });

    it("legado sem url verde fica de fora e o Instagram verde permanece", async () => {
        const legacy = record([
            { kind: "PRESENTATION", url: null, visible: true, position: 0 },
            { kind: "INSTAGRAM", url: "https://www.instagram.com/ar756_/", visible: true, position: 1 },
        ]);
        const response = await new GetVenueLinksUseCase(store(legacy).links).execute("AR756");
        expect(response.data.links.map((link) => link.kind)).toEqual(["INSTAGRAM"]);
        const editor = await new GetVenueLinkEditorUseCase(store(legacy).links, allow).execute("user-1", "AR756");
        expect(editor.data.links.map((link) => link.kind)).toEqual(["INSTAGRAM"]);
    });

    it("canReorder so vale para quem tem Site naquele espaco", async () => {
        const found = record();
        const editor = await new GetVenueLinksUseCase(store(found).links, allowSite).execute("AR756", "user-1");
        const stranger = await new GetVenueLinksUseCase(store(found).links, denySite).execute("AR756", "user-1");
        const guest = await new GetVenueLinksUseCase(store(found).links, allowSite).execute("AR756", null);
        expect(editor.data.canReorder).toBe(true);
        expect(stranger.data.canReorder).toBe(false);
        expect(guest.data.canReorder).toBe(false);
    });
});

describe("gravacao dos links", () => {
    it("recusa tipo repetido e url que nao esta verde", async () => {
        const { links } = store(record());
        const save = new SaveVenueLinksUseCase(links, allow);
        await expect(save.execute("user-1", "AR756", [
            { kind: "INSTAGRAM", url: "https://instagram.com/a", visible: true, position: 0 },
            { kind: "INSTAGRAM", url: "https://instagram.com/b", visible: true, position: 1 },
        ])).rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(save.execute("user-1", "AR756", [
            { kind: "INSTAGRAM", url: "https://facebook.com/casa", visible: false, position: 0 },
        ])).rejects.toBeInstanceOf(HttpBadRequestError);
    });

    it("replace grava as linhas e nao recebe as quatro colunas", async () => {
        const { links, replaced } = store(record());
        await new SaveVenueLinksUseCase(links, allow).execute("user-1", "AR756", [
            { kind: "INSTAGRAM", url: "https://instagram.com/ar756_", visible: false, position: 0 },
            { kind: "FACEBOOK", url: "https://facebook.com/profile.php?id=100085832906065", visible: true, position: 1 },
            { kind: "TIKTOK", url: "https://www.tiktok.com/@ar756_", visible: true, position: 2 },
        ]);
        expect(Object.keys(replaced[0] ?? {})).toEqual(["rows"]);
        expect(replaced[0]?.rows.map((row) => row.kind)).toEqual(["INSTAGRAM", "FACEBOOK", "TIKTOK"]);
    });

    it("repetir a gravacao substitui o conjunto e quem nao edita recebe 403", async () => {
        const { links, replaced } = store(record());
        const rows: VenueLinkRow[] = [
            { kind: "SITE", url: "https://www.ar756.com/", visible: true, position: 0 },
        ];
        const save = new SaveVenueLinksUseCase(links, allow);
        await save.execute("user-1", "AR756", rows);
        await save.execute("user-1", "AR756", rows);
        expect(replaced).toHaveLength(2);
        expect(replaced[1]?.rows).toHaveLength(1);
        await expect(new SaveVenueLinksUseCase(links, deny).execute("user-1", "AR756", rows)).rejects.toBeInstanceOf(HttpForbiddenError);
    });

    it("grava apresentacao com o marcador e ela entra no link tree", async () => {
        const { links, replaced } = store(record());
        const saved = await new SaveVenueLinksUseCase(links, allow).execute("user-1", "AR756", [
            { kind: "PRESENTATION", url: null, visible: true, position: 0 },
        ]);
        expect(replaced[0]?.rows[0]).toMatchObject({ kind: "PRESENTATION", url: "created", visible: true });
        expect(saved.data.links[0]).toMatchObject({ kind: "PRESENTATION", url: "created" });
        const again = await new GetVenueLinksUseCase(store(record(replaced[0]?.rows ?? [])).links).execute("AR756");
        expect(again.data.links.map((link) => link.kind)).toEqual(["PRESENTATION"]);
        expect(again.data.links[0]?.href).toBe("https://event-hub-dashboard.vercel.app/espaco/AR756/apresentacao");
    });

    it("com hostname pendente os tres caminhos internos ficam curtos e o WhatsApp nao", async () => {
        const rows: VenueLinkRow[] = [
            { kind: "PRESENTATION", url: "created", visible: true, position: 0 },
            { kind: "BUDGET_FORM", url: "created", visible: true, position: 1 },
            { kind: "RULES", url: "created", visible: true, position: 2 },
            { kind: "WHATSAPP", url: "created", visible: true, position: 3 },
        ];
        const found = record(rows);
        found.whatsappNumber = "5511999999999";
        const domains = {
            listByVenue: async () => [{
                id: "domain-1",
                venueId: found.id,
                hostname: "www.casa.com",
                status: "PENDING" as const,
                verificationType: null,
                verificationName: null,
                verificationValue: null,
            }],
        };
        const response = await new GetVenueLinksUseCase(store(found).links, allowSite, domains).execute("AR756");
        const hrefs = Object.fromEntries(response.data.links.map((link) => [link.kind, link.href]));
        expect(hrefs.PRESENTATION).toBe("https://www.casa.com/apresentacao");
        expect(hrefs.BUDGET_FORM).toBe("https://www.casa.com/formulario");
        expect(hrefs.RULES).toBe("https://www.casa.com/regras");
        expect(hrefs.WHATSAPP).toBe("https://wa.me/5511999999999");
    });

    it("grava WhatsApp sem numero fora do link tree", async () => {
        const { links, replaced } = store(record());
        const saved = await new SaveVenueLinksUseCase(links, allow).execute("user-1", "AR756", [
            { kind: "WHATSAPP", url: null, visible: false, position: 0 },
        ]);
        expect(saved.data.links[0]).toMatchObject({ url: "created", visible: false });
        const pub = await new GetVenueLinksUseCase(store(record(replaced[0]?.rows ?? [])).links).execute("AR756");
        expect(pub.data.links).toEqual([]);
    });

    it("recusa Instagram vazio ou de post e nao grava", async () => {
        const { links, replaced } = store(record());
        const save = new SaveVenueLinksUseCase(links, allow);
        await expect(save.execute("user-1", "AR756", [
            { kind: "INSTAGRAM", url: "", visible: true, position: 0 },
        ])).rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(save.execute("user-1", "AR756", [
            { kind: "INSTAGRAM", url: "https://instagram.com/p/abc", visible: true, position: 0 },
        ])).rejects.toBeInstanceOf(HttpBadRequestError);
        expect(replaced).toHaveLength(0);
    });

    it("editor sem permissao responde 403 e lista vazia nao traz apresentacao", async () => {
        const { links } = store(record());
        const editor = await new GetVenueLinkEditorUseCase(links, allow).execute("user-1", "AR756");
        expect(editor.data.links).toEqual([]);
        await expect(new GetVenueLinkEditorUseCase(links, deny).execute("user-1", "AR756")).rejects.toBeInstanceOf(HttpForbiddenError);
    });
});

describe("rotas dos links", () => {
    it("abre a leitura sem autenticacao e fecha o editor e a gravacao", () => {
        const handlers = (path: string, method: "get" | "put") => {
            const layer = (venueRoutes as unknown as {
                stack: { route?: { path: string; methods?: Record<string, boolean>; stack: { name: string; handle?: { name?: string } }[] } }[];
            }).stack.find((item) => item.route?.path === path && item.route.methods?.[method]);
            return layer?.route?.stack.map((entry) => entry.handle?.name || entry.name) ?? [];
        };

        expect(handlers("/links/:venueId", "get")).not.toContain("ensureAuthenticate");
        expect(handlers("/links/:venueId/editor", "get")).toContain("ensureAuthenticate");
        expect(handlers("/links/:venueId", "put")).toContain("ensureAuthenticate");
        expect(handlers("/links/:venueId/order", "put")).toContain("ensureAuthenticate");
        expect(handlers("/links/:venueId/hide", "put")).toContain("ensureAuthenticate");
        expect(handlers("/links/:venueId/visible", "put")).toContain("ensureAuthenticate");
        expect(handlers("/links/:venueId/create", "put")).toContain("ensureAuthenticate");
    });
});

describe("ordem e ocultar na pagina", () => {
    const page = record([
        { kind: "PRESENTATION", url: "created", visible: true, position: 0 },
        { kind: "INSTAGRAM", url: "https://www.instagram.com/ar756_/", visible: false, position: 1 },
        { kind: "RULES", url: "created", visible: true, position: 2 },
        { kind: "WHATSAPP", url: "created", visible: true, position: 3 },
    ]);
    page.whatsappNumber = "5511999999999";

    it("reordena a lista inteira e o oculto muda de lugar junto", async () => {
        const { links, replaced } = store(page);
        const response = await new OrderVenueLinksUseCase(links, allowSite).execute("user-1", "AR756", [
            "PRESENTATION",
            "RULES",
            "WHATSAPP",
            "INSTAGRAM",
        ]);
        expect(replaced[0]?.rows.map((row) => [row.kind, row.visible, row.position])).toEqual([
            ["PRESENTATION", true, 0],
            ["RULES", true, 1],
            ["WHATSAPP", true, 2],
            ["INSTAGRAM", false, 3],
        ]);
        expect(replaced[0]?.rows[3]?.url).toBe("https://www.instagram.com/ar756_/");
        expect(response.data.links.map((link) => link.kind)).toEqual(["PRESENTATION", "RULES", "WHATSAPP"]);
        expect(response.data.canReorder).toBe(true);
    });

    it("a mesma ordem nao grava de novo e uma lista parcial responde 400", async () => {
        const { links, replaced } = store(page);
        const order = new OrderVenueLinksUseCase(links, allowSite);
        await order.execute("user-1", "AR756", ["PRESENTATION", "INSTAGRAM", "RULES", "WHATSAPP"]);
        expect(replaced).toHaveLength(0);
        await expect(order.execute("user-1", "AR756", ["PRESENTATION", "RULES", "WHATSAPP"])).rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(order.execute("user-1", "AR756", ["PRESENTATION", "RULES", "INSTAGRAM"])).rejects.toBeInstanceOf(HttpBadRequestError);
        expect(replaced).toHaveLength(0);
    });

    it("ocultar desliga o visivel e mantem a linha; o que ja esta fora nao grava", async () => {
        const { links, replaced } = store(page);
        const hide = new HideVenueLinkUseCase(links, allowSite);
        const response = await hide.execute("user-1", "AR756", "WHATSAPP");
        expect(replaced[0]?.rows.find((row) => row.kind === "WHATSAPP")).toMatchObject({
            visible: false,
            position: 3,
            url: "created",
        });
        expect(replaced[0]?.rows).toHaveLength(4);
        expect(response.data.links.some((link) => link.kind === "WHATSAPP")).toBe(false);
        await hide.execute("user-1", "AR756", "INSTAGRAM");
        expect(replaced).toHaveLength(1);
    });

    it("recusa tipo ausente ou sem destino, e exige sessao e Site", async () => {
        const { links, replaced } = store(page);
        const broken = record([{ kind: "INSTAGRAM", url: "https://facebook.com/casa", visible: true, position: 0 }]);
        await expect(new HideVenueLinkUseCase(store(broken).links, allowSite).execute("user-1", "AR756", "INSTAGRAM")).rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(new HideVenueLinkUseCase(links, allowSite).execute("user-1", "AR756", "YOUTUBE")).rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(new OrderVenueLinksUseCase(links, allowSite).execute(null, "AR756", [])).rejects.toBeInstanceOf(HttpTokenError);
        await expect(new HideVenueLinkUseCase(links, denySite).execute("user-1", "AR756", "RULES")).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(new OrderVenueLinksUseCase(store(null).links, allowSite).execute("user-1", "AR756", [])).rejects.toBeInstanceOf(HttpResourceNotFoundError);
        expect(replaced).toHaveLength(0);
        expect(store(broken).replaced).toHaveLength(0);
    });
});

describe("criar link na pagina publica", () => {
    it("sem token responde 401 e nao grava", async () => {
        const { links, replaced } = store(record());
        await expect(new CreateVenueLinkUseCase(links, allowSite).execute(null, "AR756", "INSTAGRAM", "https://www.instagram.com/ar756_/")).rejects.toBeInstanceOf(HttpTokenError);
        expect(replaced).toHaveLength(0);
    });

    it("sem permissao de site responde 403 e nao grava", async () => {
        const { links, replaced } = store(record());
        await expect(new CreateVenueLinkUseCase(links, denySite).execute("user-1", "AR756", "INSTAGRAM", "https://www.instagram.com/ar756_/")).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(replaced).toHaveLength(0);
    });

    it("instagram verde grava, volta no GET e entra em usedKinds", async () => {
        const { links, replaced } = store(record());
        const created = await new CreateVenueLinkUseCase(links, allowSite).execute("user-1", "AR756", "INSTAGRAM", "https://www.instagram.com/ar756_/");
        expect(created.data.links.map((link) => link.kind)).toEqual(["INSTAGRAM"]);
        expect(created.data.usedKinds).toEqual(["INSTAGRAM"]);
        const again = await new GetVenueLinksUseCase(store(record(replaced[0]?.rows ?? [])).links, allowSite).execute("AR756", "user-1");
        expect(again.data.links.map((link) => link.kind)).toEqual(["INSTAGRAM"]);
        expect(again.data.usedKinds).toEqual(["INSTAGRAM"]);
    });

    it("tipo repetido, mesmo oculto, responde 400 e nao grava", async () => {
        const hidden = record([{ kind: "INSTAGRAM", url: "https://www.instagram.com/ar756_/", visible: false, position: 0 }]);
        const { links, replaced } = store(hidden);
        await expect(new CreateVenueLinkUseCase(links, allowSite).execute("user-1", "AR756", "INSTAGRAM", "https://www.instagram.com/outro")).rejects.toThrow("Essa rede ja existe.");
        expect(replaced).toHaveLength(0);
    });

    it("url que nao fica verde responde 400 com a mensagem do check e nao grava", async () => {
        const { links, replaced } = store(record());
        await expect(new CreateVenueLinkUseCase(links, allowSite).execute("user-1", "AR756", "INSTAGRAM", "")).rejects.toThrow("Cole o link.");
        expect(replaced).toHaveLength(0);
    });

    it("whatsapp sem numero responde 400 e nao grava", async () => {
        const { links, replaced } = store(record());
        await expect(new CreateVenueLinkUseCase(links, allowSite).execute("user-1", "AR756", "WHATSAPP", null)).rejects.toThrow("Preencha o WhatsApp em Geral.");
        expect(replaced).toHaveLength(0);
    });

    it("create colado grava o visible recebido", async () => {
        const { links, replaced } = store(record());
        const created = await new CreateVenueLinkUseCase(links, allowSite).execute(
            "user-1",
            "AR756",
            "INSTAGRAM",
            "https://www.instagram.com/ar756_/",
            false,
        );
        expect(replaced[0]?.rows[0]).toMatchObject({
            kind: "INSTAGRAM",
            visible: false,
            url: expect.stringContaining("instagram.com/ar756_"),
        });
        expect(created.data.links).toEqual([]);
        expect(Object.keys(replaced[0] ?? {})).toEqual(["rows"]);
    });

    it("GET sem usuario nao traz usedKinds e com permissao traz o oculto", async () => {
        const hidden = record([{ kind: "INSTAGRAM", url: "https://www.instagram.com/ar756_/", visible: false, position: 0 }]);
        const guest = await new GetVenueLinksUseCase(store(hidden).links, allowSite).execute("AR756", null);
        const editor = await new GetVenueLinksUseCase(store(hidden).links, allowSite).execute("AR756", "user-1");
        expect(guest.data).not.toHaveProperty("usedKinds");
        expect(guest.data.links).toEqual([]);
        expect(editor.data.usedKinds).toEqual(["INSTAGRAM"]);
        expect(editor.data.links).toEqual([]);
    });
});

describe("copia do legado", () => {
    it("coluna verde sem linha vira linha visivel", async () => {
        const found = legacyColumns(record());
        const { links, inserted } = store(found);
        const response = await new GetVenueLinksUseCase(links).execute("AR756");
        expect(response.data.links.map((link) => [link.kind, link.href])).toEqual([
            ["SITE", "https://www.ar756.com/"],
            ["INSTAGRAM", "https://www.instagram.com/ar756_/"],
            ["FACEBOOK", "https://www.facebook.com/profile.php?id=100085832906065"],
            ["TIKTOK", "https://www.tiktok.com/@ar756_"],
        ]);
        expect(inserted[0]?.every((row) => row.visible)).toBe(true);
        const editor = await new GetVenueLinkEditorUseCase(store(legacyColumns(record())).links, allow).execute("user-1", "AR756");
        expect(editor.data.links.map((link) => link.kind)).toEqual(["SITE", "INSTAGRAM", "FACEBOOK", "TIKTOK"]);
    });

    it("coluna vazia ou sem url verde nao cria linha", async () => {
        const found = record();
        found.url = "   ";
        found.instagramUrl = "https://www.instagram.com/p/abc";
        const { links, inserted } = store(found);
        const response = await new GetVenueLinksUseCase(links).execute("AR756");
        expect(response.data.links).toEqual([]);
        expect(inserted).toEqual([]);
    });

    it("linha existente nao muda url nem visible na copia", async () => {
        const found = legacyColumns(record([
            { kind: "INSTAGRAM", url: "https://www.instagram.com/outra/", visible: false, position: 4 },
        ]));
        const { links, inserted } = store(found);
        await new GetVenueLinksUseCase(links).execute("AR756");
        expect(found.links.find((row) => row.kind === "INSTAGRAM")).toMatchObject({
            url: "https://www.instagram.com/outra/",
            visible: false,
        });
        expect(inserted[0]?.some((row) => row.kind === "INSTAGRAM")).toBe(false);
        expect(inserted[0]?.map((row) => row.kind)).toEqual(["SITE", "FACEBOOK", "TIKTOK"]);
    });

    it("repetir a copia nao duplica", async () => {
        const found = legacyColumns(record());
        const inserted: VenueLinkRow[][] = [];
        const links: VenueLinkRepository = {
            findByKey: async () => found,
            replace: async () => undefined,
            insertMissing: async (_venueId, rows) => {
                inserted.push(rows);
                found.links = [...found.links, ...rows];
            },
            deleteKinds: async () => undefined,
        };
        const useCase = new GetVenueLinksUseCase(links);
        await useCase.execute("AR756");
        await useCase.execute("AR756");
        expect(inserted).toHaveLength(1);
        expect(found.links.filter((row) => row.kind === "INSTAGRAM")).toHaveLength(1);
    });
});

describe("PUT /venue/links/:venueId/visible", () => {
    it("grava { kind, visible } e repetir o mesmo valor nao grava nem mexe nas colunas", async () => {
        const found = record([
            { kind: "INSTAGRAM", url: "https://www.instagram.com/ar756_/", visible: true, position: 0 },
        ]);
        const { links, replaced } = store(found);
        const useCase = new SetVenueLinkVisibleUseCase(links, allowSite);
        await useCase.execute("user-1", "AR756", "INSTAGRAM", true);
        expect(replaced).toHaveLength(0);
        const hidden = await useCase.execute("user-1", "AR756", "INSTAGRAM", false);
        expect(Object.keys(replaced[0] ?? {})).toEqual(["rows"]);
        expect(replaced[0]?.rows[0]).toMatchObject({ kind: "INSTAGRAM", visible: false });
        expect(hidden.data.links).toEqual([]);
        await expect(new SetVenueLinkVisibleUseCase(links, denySite).execute("user-1", "AR756", "INSTAGRAM", false)).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(replaced).toHaveLength(1);
    });
});

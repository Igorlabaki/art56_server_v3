import { describe, expect, it } from "vitest";
import { checkVenueLinkUrl, createVenueLink, createdVenueLinks, defaultVenueLinks, linkTreePlace, publicVenueLinks, replaceVenueLinkUrl, VENUE_LINK_KINDS, VENUE_LINK_SUBTITLE, type VenueLinkKind, type VenueLinkSource } from "./venue-link";

const ar756: VenueLinkSource = {
    url: "https://www.ar756.com/",
    instagramUrl: "https://www.instagram.com/ar756_/",
    facebookUrl: "https://www.facebook.com/profile.php?id=100085832906065",
    tiktokUrl: "https://www.tiktok.com/@ar756_",
    whatsappNumber: "",
    email: null,
    tourVideoUrl: "https://www.youtube.com/watch?v=TfdZorJpR1I",
    street: "Rua A",
    streetNumber: "10",
    neighborhood: "Centro",
    city: "Ubatuba",
    state: "SP",
    organizationUrl: null,
};

describe("checagem do link colado", () => {
    it("reconhece o perfil do Instagram e recusa post, reel, story e explore", () => {
        expect(checkVenueLinkUrl("INSTAGRAM", "instagram.com/ar756_").status).toBe("green");
        for (const path of ["p/abc", "reel/abc", "reels/abc", "stories/ar756_", "explore/tags/casa"]) {
            expect(checkVenueLinkUrl("INSTAGRAM", `https://www.instagram.com/${path}`).status).toBe("amber");
        }
        expect(checkVenueLinkUrl("INSTAGRAM", "https://facebook.com/casa").status).toBe("red");
    });

    it("aceita o perfil numerico do Facebook", () => {
        const check = checkVenueLinkUrl("FACEBOOK", "https://www.facebook.com/profile.php?id=100085832906065");
        expect(check.status).toBe("green");
        expect(check.href).toContain("profile.php?id=100085832906065");
    });

    it("reconhece o perfil do TikTok e recusa um video", () => {
        expect(checkVenueLinkUrl("TIKTOK", "https://www.tiktok.com/@ar756_").status).toBe("green");
        expect(checkVenueLinkUrl("TIKTOK", "https://www.tiktok.com/@ar756_/video/123").status).toBe("amber");
    });

    it("recusa rede social no campo do site", () => {
        expect(checkVenueLinkUrl("SITE", "https://instagram.com/ar756_").status).toBe("red");
        expect(checkVenueLinkUrl("SITE", "www.ar756.com").status).toBe("green");
    });

    it("separa o canal do YouTube de um video", () => {
        expect(checkVenueLinkUrl("YOUTUBE", "https://www.youtube.com/@ar756").status).toBe("green");
        expect(checkVenueLinkUrl("YOUTUBE", "https://www.youtube.com/watch?v=TfdZorJpR1I").status).toBe("amber");
        expect(checkVenueLinkUrl("YOUTUBE", "https://youtu.be/TfdZorJpR1I").message).toMatch(/Apresentação/);
    });
});

const GREEN_URL: Record<VenueLinkKind, string | null> = {
    PRESENTATION: null,
    BUDGET_FORM: null,
    RULES: null,
    WHATSAPP: null,
    EMAIL: null,
    GOOGLE_MAPS: null,
    TOUR_VIDEO: null,
    ORGANIZATION_SITE: null,
    SITE: "https://www.ar756.com/",
    INSTAGRAM: "https://www.instagram.com/ar756_/",
    FACEBOOK: "https://www.facebook.com/profile.php?id=100085832906065",
    TIKTOK: "https://www.tiktok.com/@ar756_",
    YOUTUBE: "https://www.youtube.com/@ar756",
    GOOGLE_BUSINESS: "https://g.page/ar756",
    PINTEREST: "https://br.pinterest.com/ar756",
    LINKEDIN: "https://www.linkedin.com/company/ar756",
    TRIPADVISOR: "https://www.tripadvisor.com.br/ar756",
    AIRBNB: "https://www.airbnb.com.br/rooms/1",
    MENU: "https://www.ar756.com/cardapio.pdf",
};

describe("subtitulo do link publico", () => {
    it("cada tipo visivel leva a frase fixa e o oculto fica de fora", () => {
        const source: VenueLinkSource = {
            ...ar756,
            whatsappNumber: "5511999999999",
            email: "casa@ar756.com",
            organizationUrl: "https://org.example",
        };
        for (const kind of VENUE_LINK_KINDS) {
            const shown = publicVenueLinks("AR756", [
                { kind, url: GREEN_URL[kind], visible: true, position: 0 },
            ], source);
            expect(shown).toEqual([
                expect.objectContaining({ kind, subtitle: VENUE_LINK_SUBTITLE[kind] }),
            ]);
            const hidden = publicVenueLinks("AR756", [
                { kind, url: GREEN_URL[kind], visible: false, position: 0 },
            ], source);
            expect(hidden).toEqual([]);
        }
    });
});

describe("lista padrao", () => {
    it("liga apresentacao, orcamento, regras e os quatro links preenchidos da AR756", () => {
        const rows = defaultVenueLinks(ar756);
        const visible = Object.fromEntries(rows.map((row) => [row.kind, row.visible]));
        expect(visible.PRESENTATION).toBe(true);
        expect(visible.BUDGET_FORM).toBe(true);
        expect(visible.RULES).toBe(true);
        expect(visible.INSTAGRAM).toBe(true);
        expect(visible.FACEBOOK).toBe(true);
        expect(visible.TIKTOK).toBe(true);
        expect(visible.SITE).toBe(true);
    });

    it("deixa o WhatsApp na lista sem nascer visivel", () => {
        const whatsapp = defaultVenueLinks(ar756).find((row) => row.kind === "WHATSAPP");
        expect(whatsapp).toMatchObject({ visible: false });
    });

    it("so inclui o site da organizacao quando a url existe", () => {
        expect(defaultVenueLinks(ar756).some((row) => row.kind === "ORGANIZATION_SITE")).toBe(false);
        expect(defaultVenueLinks({ ...ar756, organizationUrl: "https://org.example" }).some((row) => row.kind === "ORGANIZATION_SITE")).toBe(true);
    });
});

describe("rede criada", () => {
    it("descarta o legado sem url verde e mantem o Instagram e a regra marcada", () => {
        const kept = createdVenueLinks([
            { kind: "PRESENTATION", url: null, visible: true, position: 0 },
            { kind: "INSTAGRAM", url: "https://www.instagram.com/ar756_/", visible: true, position: 1 },
            { kind: "RULES", url: "created", visible: true, position: 2 },
        ]);
        expect(kept.map((row) => row.kind)).toEqual(["INSTAGRAM", "RULES"]);
    });

    it("so cria link colado verde e destino gerado com o marcador", () => {
        const empty = [] as const;
        expect(createVenueLink([...empty], "INSTAGRAM", "https://instagram.com/p/abc", "AR756", ar756)).toEqual([]);
        const instagram = createVenueLink([], "INSTAGRAM", "instagram.com/ar756_", "AR756", ar756);
        expect(instagram).toEqual([
            expect.objectContaining({ kind: "INSTAGRAM", visible: true, url: expect.stringContaining("instagram.com/ar756_") }),
        ]);
        expect(createVenueLink(instagram, "INSTAGRAM", "instagram.com/outra", "AR756", ar756)).toBe(instagram);
        const whatsapp = createVenueLink([], "WHATSAPP", null, "AR756", ar756);
        expect(whatsapp[0]).toMatchObject({ kind: "WHATSAPP", url: "created", visible: false });
        const presentation = createVenueLink([], "PRESENTATION", null, "AR756", ar756);
        expect(presentation[0]).toMatchObject({ kind: "PRESENTATION", url: "created", visible: true });
        const tour = createVenueLink([], "TOUR_VIDEO", null, "AR756", ar756, false);
        expect(tour[0]).toMatchObject({ kind: "TOUR_VIDEO", url: "created", visible: false });
    });

    it("video e mapa ocultos saem do topo e do rodape", () => {
        const hidden = linkTreePlace([
            { kind: "TOUR_VIDEO", url: "created", visible: false, position: 1 },
            { kind: "GOOGLE_MAPS", url: "created", visible: false, position: 2 },
        ], ar756);
        expect(hidden.tourVideoUrl).toBeNull();
        expect(hidden.mapQuery).toBeNull();
        const shown = linkTreePlace([
            { kind: "TOUR_VIDEO", url: "created", visible: true, position: 4 },
            { kind: "GOOGLE_MAPS", url: "created", visible: true, position: 0 },
        ], ar756);
        expect(shown.tourVideoUrl).toBe(ar756.tourVideoUrl);
        expect(shown.mapQuery).toBe("Rua A, 10, Centro, Ubatuba, SP");
        expect(linkTreePlace([], ar756).mapQuery).toBe("Rua A, 10, Centro, Ubatuba, SP");
    });

    it("troca a url so quando o novo link e verde", () => {
        const rows = [{ kind: "INSTAGRAM" as const, url: "https://instagram.com/ar756_/", visible: true, position: 0 }];
        expect(replaceVenueLinkUrl(rows, "INSTAGRAM", "https://instagram.com/p/abc")).toBe(rows);
        expect(replaceVenueLinkUrl(rows, "PRESENTATION", "created")).toBe(rows);
        const next = replaceVenueLinkUrl(rows, "INSTAGRAM", "https://instagram.com/outra");
        expect(next[0]?.url).toContain("instagram.com/outra");
        expect(rows[0]?.url).toContain("ar756_");
    });
});

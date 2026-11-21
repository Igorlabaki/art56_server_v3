import { sign } from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { toVenuePresentation, VenuePublicPresentationSource } from "../../../functions/to-venue-presentation";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { venueRoutes } from "../../../router/venue";
import { GetVenuePresentationController } from "./controller-get-venue-presentation";
import { GetVenuePresentationUseCase } from "./use-case-get-venue-presentation";

const ALLOWED_KEYS = [
    "name",
    "description",
    "slogan",
    "logoUrl",
    "faviconUrl",
    "proposalPrimaryColor",
    "proposalSecondaryColor",
    "proposalTextColor",
    "url",
    "instagramUrl",
    "facebookUrl",
    "tiktokUrl",
    "tourVideoUrl",
    "whatsappNumber",
    "links",
    "neighborhood",
    "city",
    "state",
    "street",
    "streetNumber",
    "maxGuest",
    "hasOvernightStay",
    "checkIn",
    "checkOut",
    "minimumNights",
    "openingHour",
    "closingHour",
    "images",
    "amenities",
    "services",
    "pricing",
];

function keysDeep(value: unknown): string[] {
    if (!value || typeof value !== "object") return [];
    if (Array.isArray(value)) return value.flatMap(keysDeep);
    return Object.entries(value).flatMap(([key, child]) => [key, ...keysDeep(child)]);
}

function source(overrides: Partial<VenuePublicPresentationSource> = {}): VenuePublicPresentationSource {
    return {
        id: "venue-1",
        name: "Casa Aurora",
        description: "Jardim",
        slogan: "O OASIS URBANO",
        logoUrl: "https://cdn.example/logo.png",
        faviconUrl: "https://cdn.example/favicon.png",
        proposalPrimaryColor: "#111315",
        proposalSecondaryColor: "#ffffff",
        proposalTextColor: "#181818",
        url: "https://casa.example",
        instagramUrl: "https://instagram.com/casa",
        facebookUrl: null,
        tiktokUrl: null,
        tourVideoUrl: "https://youtu.be/abc",
        whatsappNumber: "5511999999999",
        neighborhood: "Centro",
        city: "Ubatuba",
        state: "SP",
        street: "Rua das Flores",
        streetNumber: "10",
        maxGuest: 120,
        hasOvernightStay: false,
        checkIn: null,
        checkOut: null,
        minimumNights: null,
        openingHour: "08:00",
        closingHour: "22:00",
        pricingModel: "PER_PERSON",
        pricePerPerson: 150,
        pricePerDay: 900,
        pricePerPersonDay: 80,
        pricePerPersonHour: 20,
        minimumPrice: 0,
        images: [
            {
                id: "photo-b",
                imageUrl: "https://cdn.example/b.png",
                description: "Piscina",
                position: 2,
                isShowOnProposal: true,
            },
            {
                id: "photo-hidden",
                imageUrl: "https://cdn.example/hidden.png",
                description: "Interna",
                position: 0,
                isShowOnProposal: false,
            },
            {
                id: "photo-a",
                imageUrl: "https://cdn.example/a.png",
                description: null,
                position: 1,
                isShowOnProposal: true,
            },
        ],
        amenities: [
            {
                name: "Piscina",
                position: 0,
                description: "Aquecida",
                images: ["https://cdn.example/pool.png"],
                imageUrl: "https://cdn.example/pool.png",
                videoUrl: null,
            },
        ],
        services: [
            {
                id: "svc-b",
                name: "Som",
                description: null,
                imageUrl: null,
                price: 400,
                pricingType: "FIXED",
                rpaRequired: true,
                rpaMinPeople: 50,
            },
            {
                id: "svc-a",
                name: "Bar",
                description: "Aberto",
                imageUrl: "https://cdn.example/bar.png",
                price: 200,
            },
        ],
        ...overrides,
    };
}

describe("apresentacao publica do espaco", () => {
    it("devolve so o recorte, filtra foto e tira o preco do servico", () => {
        const data = toVenuePresentation(source());
        expect(data.links).toEqual([]);

        expect(Object.keys(data).sort()).toEqual([...ALLOWED_KEYS].sort());
        expect(data.images).toEqual([
            { id: "photo-a", imageUrl: "https://cdn.example/a.png", description: null, position: 1 },
            { id: "photo-b", imageUrl: "https://cdn.example/b.png", description: "Piscina", position: 2 },
        ]);
        expect(data.services).toEqual([
            { id: "svc-a", name: "Bar", description: "Aberto", imageUrl: "https://cdn.example/bar.png" },
            { id: "svc-b", name: "Som", description: null, imageUrl: null },
        ]);
        expect(data.pricing).toEqual({ model: "PER_PERSON", amount: 150, minimumPrice: null });
        expect(data.slogan).toBe("O OASIS URBANO");
        expect(keysDeep(data)).not.toEqual(expect.arrayContaining([
            "price",
            "email",
            "cep",
            "complement",
            "owner",
            "ownerVenue",
            "organization",
            "organizationId",
            "canReorder",
            "catalog",
            "pricingType",
            "rpaRequired",
            "rpaMinPeople",
            "pricePerPerson",
            "pricePerDay",
            "pricePerPersonDay",
            "pricePerPersonHour",
        ]));
    });

    it("devolve o slogan e conserva null", () => {
        expect(toVenuePresentation(source()).slogan).toBe("O OASIS URBANO");
        expect(toVenuePresentation(source({ slogan: null })).slogan).toBeNull();
    });

    it("usa o preco do modelo ativo e anula o minimo zerado", () => {
        expect(toVenuePresentation(source({ pricingModel: "PER_DAY", minimumPrice: 500 })).pricing).toEqual({
            model: "PER_DAY",
            amount: 900,
            minimumPrice: 500,
        });
        expect(toVenuePresentation(source({ pricingModel: "PER_PERSON_HOUR" })).pricing.amount).toBe(20);
        expect(toVenuePresentation(source({ pricingModel: "PER_PERSON_DAY" })).pricing.amount).toBe(80);
        expect(toVenuePresentation(source({ pricingModel: "TIERED", pricePerPerson: 150 })).pricing.amount).toBeNull();
    });

    it("responde 404 quando o espaco nao existe e 200 com o recorte quando existe", async () => {
        const missing = new GetVenuePresentationUseCase({
            getPublicPresentation: async () => null,
            listImageCatalog: async () => null,
        });
        await expect(missing.execute("venue-x")).rejects.toBeInstanceOf(HttpResourceNotFoundError);

        const found = new GetVenuePresentationUseCase({
            getPublicPresentation: async () => source(),
            listImageCatalog: async () => null,
        });
        const listed = await found.execute("venue-a");
        expect(listed.data.services.map((service) => service.name)).toEqual(["Bar", "Som"]);
        expect(listed.data.images).toHaveLength(2);

        const response = {
            statusCode: 0,
            body: null as unknown,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            json(body: unknown) {
                this.body = body;
                return this;
            },
        };
        await new GetVenuePresentationController(missing).handle(
            { params: { venueId: "venue-x" }, headers: {} } as never,
            response as never,
        );
        expect(response.statusCode).toBe(404);
    });

    it("com Site devolve a foto de fora e sem Site nao consulta o catalogo", async () => {
        let catalogCalls = 0;
        const reader = {
            getPublicPresentation: async () => source(),
            listImageCatalog: async () => {
                catalogCalls += 1;
                return {
                    venueId: "venue-1",
                    images: source().images.map((image) => ({
                        ...image,
                        isShowOnProposal: image.isShowOnProposal === true,
                    })),
                };
            },
        };
        const editor = new GetVenuePresentationUseCase(reader, { canEditVenueSite: async () => true });
        const edited = await editor.execute("Casa Aurora", "owner-1");
        expect(edited.data.canReorder).toBe(true);
        expect(JSON.stringify(edited.data.catalog)).toContain("hidden.png");
        expect(edited.data.images.map((image) => image.id)).not.toContain("photo-hidden");

        catalogCalls = 0;
        const stranger = new GetVenuePresentationUseCase(reader, { canEditVenueSite: async () => false });
        const denied = await stranger.execute("Casa Aurora", "other-1");
        const guest = await new GetVenuePresentationUseCase(reader, { canEditVenueSite: async () => true }).execute("Casa Aurora", null);
        expect(catalogCalls).toBe(0);
        expect(denied.data.canReorder).toBe(false);
        expect(denied.data.catalog).toEqual([]);
        expect(guest.data.catalog).toEqual([]);
        expect(JSON.stringify(denied.data)).not.toContain("hidden.png");
        expect(JSON.stringify(guest.data)).not.toContain("hidden.png");

        const token = sign({ id: "owner-1" }, "venue-presentation-secret");
        process.env.JWT_SECRET_KEY = "venue-presentation-secret";
        const response = {
            statusCode: 0,
            body: null as { data?: { canReorder?: boolean } } | null,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            json(body: { data?: { canReorder?: boolean } }) {
                this.body = body;
                return this;
            },
        };
        await new GetVenuePresentationController(editor).handle(
            { params: { venueId: "Casa Aurora" }, headers: { authorization: `Bearer ${token}` } } as never,
            response as never,
        );
        expect(response.statusCode).toBe(200);
        expect(response.body?.data?.canReorder).toBe(true);
    });

    it("publica a apresentacao sem autenticacao e mantem a gravacao fechada", () => {
        const handlers = (path: string) => {
            const layer = (venueRoutes as unknown as {
                stack: { route?: { path: string; stack: { name: string; handle?: { name?: string } }[] } }[];
            }).stack.find((item) => item.route?.path === path);
            return layer?.route?.stack.map((entry) => entry.handle?.name || entry.name) ?? [];
        };

        expect(handlers("/presentation/:venueId").length).toBeGreaterThan(0);
        expect(handlers("/presentation/:venueId")).not.toContain("ensureAuthenticate");
        expect(handlers("/presentation/:venueId/image-order")).toContain("ensureAuthenticate");
        expect(handlers("/presentation/:venueId/image-choice")).toContain("ensureAuthenticate");
        expect(handlers("/update")).toContain("ensureAuthenticate");
        expect(handlers("/delete/:venueId")).toContain("ensureAuthenticate");
    });
});

const PRESENTATION_UUID = "8159e209-0057-4df3-ae72-855363c3b84e";

describe("apresentacao publica pelo nome do espaco", () => {
    function capture(found: boolean) {
        const calls: Array<{ where: unknown; select: Record<string, unknown> }> = [];
        const prisma = {
            venue: {
                findUnique: async (args: { where: unknown; select: Record<string, unknown> }) => {
                    calls.push(args);
                    if (!found) return null;
                    return {
                        ...source(),
                        amenities: [],
                        services: source().services,
                    };
                },
            },
        };
        return { prisma, calls };
    }

    it("busca pelo nome decodificado e o recorte nao ganha dono, contrato nem pagamento", async () => {
        const { prisma, calls } = capture(true);
        const useCase = new GetVenuePresentationUseCase(new PrismaVenueRepository(prisma as never));

        const listed = await useCase.execute("Casa Norte");

        expect(calls).toHaveLength(1);
        expect(calls[0].where).toEqual({ name: "Casa Norte" });
        expect(calls[0].select).not.toHaveProperty("ownerVenue");
        expect(calls[0].select).not.toHaveProperty("contracts");
        expect(calls[0].select).not.toHaveProperty("Payment");
        expect(calls[0].select).not.toHaveProperty("attachments");
        expect(Object.keys(listed.data).sort()).toEqual([...ALLOWED_KEYS, "canReorder", "catalog"].sort());
        expect(listed.data.canReorder).toBe(false);
        expect(listed.data.catalog).toEqual([]);
        expect(JSON.stringify(listed.data)).not.toContain("hidden.png");
        const body = JSON.stringify(listed);
        for (const field of ["owner\"", "cpf", "pix", "contract", "payment"]) {
            expect(body).not.toContain(field);
        }
    });

    it("UUID busca por id e para", async () => {
        const { prisma, calls } = capture(true);
        const repository = new PrismaVenueRepository(prisma as never);

        await repository.getPublicPresentation(PRESENTATION_UUID);

        expect(calls).toEqual([expect.objectContaining({ where: { id: PRESENTATION_UUID } })]);
    });

    it("nome ausente devolve 404", async () => {
        const { prisma, calls } = capture(false);
        const useCase = new GetVenuePresentationUseCase(new PrismaVenueRepository(prisma as never));

        await expect(useCase.execute("Casa Norte")).rejects.toBeInstanceOf(HttpResourceNotFoundError);
        expect(calls).toHaveLength(1);
        expect(calls[0].where).toEqual({ name: "Casa Norte" });
    });

    it("link visivel entra com kind, label e href; o oculto fica de fora", () => {
        const data = toVenuePresentation(source({
            instagramUrl: "https://instagram.com/coluna",
            links: [
                { kind: "INSTAGRAM", url: "https://www.instagram.com/ar756_/", visible: true, position: 0 },
                { kind: "FACEBOOK", url: "https://www.facebook.com/casa", visible: false, position: 1 },
                { kind: "WHATSAPP", url: "created", visible: true, position: 2 },
                { kind: "PRESENTATION", url: "created", visible: true, position: 3 },
                { kind: "BUDGET_FORM", url: "created", visible: true, position: 4 },
                { kind: "RULES", url: "created", visible: true, position: 5 },
                { kind: "EMAIL", url: "created", visible: true, position: 6 },
                { kind: "GOOGLE_MAPS", url: "created", visible: true, position: 7 },
                { kind: "ORGANIZATION_SITE", url: "created", visible: true, position: 8 },
            ],
            email: "casa@example.com",
            organizationUrl: "https://org.example",
        }));
        expect(data.links).toEqual([
            { kind: "INSTAGRAM", label: "Instagram", href: "https://www.instagram.com/ar756_/" },
            { kind: "WHATSAPP", label: "WhatsApp", href: "https://wa.me/5511999999999" },
            { kind: "PRESENTATION", label: "Apresentação", href: "https://event-hub-dashboard.vercel.app/espaco/Casa%20Aurora/apresentacao" },
            { kind: "BUDGET_FORM", label: "Fazer orçamento", href: "https://event-hub-dashboard.vercel.app/espaco/Casa%20Aurora/formulario" },
            { kind: "RULES", label: "Regras", href: "https://event-hub-dashboard.vercel.app/espaco/Casa%20Aurora/regras" },
            { kind: "EMAIL", label: "E-mail", href: "mailto:casa@example.com" },
            { kind: "GOOGLE_MAPS", label: "Google Maps", href: "https://www.google.com/maps/search/?api=1&query=Rua%20das%20Flores%2C%2010%2C%20Centro%2C%20Ubatuba%2C%20SP" },
            { kind: "ORGANIZATION_SITE", label: "Site da organização", href: "https://org.example" },
        ]);
        expect(data).not.toHaveProperty("email");
        expect(data).not.toHaveProperty("organizationUrl");
        expect(data.instagramUrl).toBe("https://instagram.com/coluna");
    });
});

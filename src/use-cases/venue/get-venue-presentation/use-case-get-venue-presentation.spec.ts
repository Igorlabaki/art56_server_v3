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
    "proposalPrimaryColor",
    "proposalSecondaryColor",
    "proposalTextColor",
    "url",
    "instagramUrl",
    "facebookUrl",
    "tiktokUrl",
    "tourVideoUrl",
    "whatsappNumber",
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
        name: "Casa Aurora",
        description: "Jardim",
        slogan: "O OASIS URBANO",
        logoUrl: "https://cdn.example/logo.png",
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
        });
        await expect(missing.execute("venue-x")).rejects.toBeInstanceOf(HttpResourceNotFoundError);

        const found = new GetVenuePresentationUseCase({
            getPublicPresentation: async () => source(),
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
            { params: { venueId: "venue-x" } } as never,
            response as never,
        );
        expect(response.statusCode).toBe(404);
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
        expect(Object.keys(listed.data).sort()).toEqual([...ALLOWED_KEYS].sort());
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
});

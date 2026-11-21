import { sign } from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { readOptionalUserId } from "../../../middleware/ensureAuthenticate";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { ProposalPresentationRecord, ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { VenueSiteEditPermission } from "../../../repositories/interface/venue-site-edit-permission-interface";
import { toProposalPresentation } from "../../../functions/to-proposal-presentation";
import { proposalRoutes } from "../../../router/proposal";
import { GetProposalPresentationController } from "./controller-get-proposal-presentation";
import { GetProposalPresentationUseCase } from "./use-case-get-proposal-presentation";

const secret = "presentation-test-secret";
process.env.JWT_SECRET_KEY = secret;

const record: ProposalPresentationRecord = {
    venueId: "venue-1",
    name: "AR756",
    description: "Casa",
    slogan: "O OASIS URBANO",
    logoUrl: "https://logo",
    faviconUrl: "https://favicon",
    city: "Campinas",
    state: "SP",
    neighborhood: "Cambuí",
    street: "Rua A",
    streetNumber: "10",
    maxGuest: 80,
    hasOvernightStay: false,
    checkIn: null,
    checkOut: null,
    minimumNights: null,
    openingHour: "08:00",
    closingHour: "22:00",
    url: "https://www.ar756.com/",
    instagramUrl: "https://instagram.com/ar756_",
    facebookUrl: "https://facebook.com/ar756",
    tiktokUrl: null,
    tourVideoUrl: "https://cdn.example.com/tour.mp4",
    whatsappNumber: "19999999999",
    proposalPrimaryColor: "#112233",
    proposalSecondaryColor: null,
    proposalTextColor: "#222222",
    images: [{ id: "img-1", imageUrl: "https://foto", description: null, position: 1 }],
    amenities: [
        {
            name: "Piscina",
            position: 0,
            description: "Aquecida o ano todo",
            images: [
                "https://bucket.s3.region.amazonaws.com/piscina.webp",
                "https://bucket.s3.region.amazonaws.com/deck.webp",
                "https://bucket.s3.region.amazonaws.com/borda.webp",
            ],
            imageUrl: "https://bucket.s3.region.amazonaws.com/piscina.webp",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
        { name: "Telao", position: 1, description: null, images: [], imageUrl: null, videoUrl: null },
    ],
};

function permission(allowed: boolean): VenueSiteEditPermission {
    return { canEditVenueSite: async () => allowed };
}

const oldProposalId = "7a6974ae-d08f-4b9b-97a4-ccf3998aa7e7";

function publicCodeGallery() {
    const images = [
        { id: "a", imageUrl: "https://a", description: null, position: 1, isShowOnProposal: true },
        { id: "hidden", imageUrl: "https://oculta", description: null, position: 2, isShowOnProposal: false },
    ];
    const venue = (onlyVisible: boolean) => ({
        id: "venue-1",
        name: "AR756",
        description: null,
        slogan: null,
        logoUrl: null,
        faviconUrl: null,
        city: "Campinas",
        state: "SP",
        neighborhood: "Centro",
        street: "Rua",
        streetNumber: "1",
        maxGuest: 10,
        hasOvernightStay: false,
        checkIn: null,
        checkOut: null,
        minimumNights: null,
        openingHour: null,
        closingHour: null,
        url: null,
        instagramUrl: null,
        facebookUrl: null,
        tiktokUrl: null,
        tourVideoUrl: null,
        whatsappNumber: null,
        proposalPrimaryColor: null,
        proposalSecondaryColor: null,
        proposalTextColor: null,
        images: onlyVisible ? images.filter((image) => image.isShowOnProposal) : images,
        amenities: [],
    });
    return {
        proposal: {
            findUnique: async (args: { where: { id?: string; publicCode?: string }; select?: { venue?: { select?: { images?: { where?: { isShowOnProposal?: boolean } } } } } }) => {
                const known = args.where.publicCode === "k7m2abcd" || args.where.id === "real-id" || args.where.id === oldProposalId;
                if (!known) return null;
                if (args.where.publicCode === "k7m2abcd" && !args.select?.venue) return { id: "real-id" };
                const onlyVisible = args.select?.venue?.select?.images?.where?.isShowOnProposal === true;
                return { venue: venue(onlyVisible) };
            },
        },
    };
}

function useCase(repository: Partial<ProposalRepositoryInterface>, allowed = false) {
    return new GetProposalPresentationUseCase({
        listVenueImageCatalog: async () => ({ venueId: "venue-1", images: [] }),
        ...repository,
    } as ProposalRepositoryInterface, permission(allowed));
}

function responseDouble() {
    return {
        statusCode: 0,
        body: null as { data?: { canReorder?: boolean; images?: { id: string }[] } } | null,
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(body: { data?: { canReorder?: boolean; images?: { id: string }[] } }) {
            this.body = body;
            return this;
        },
    };
}

describe("pacote publico da proposta", () => {
    it("mantem foto marcada e caracteristica e descarta dado interno", () => {
        const packed = toProposalPresentation({
            ...record,
            amenities: record.amenities.map((amenity) => ({ ...amenity, id: "a1", venueId: "v1", createdAt: new Date() })),
            cep: "00000-000",
            email: "casa@example.com",
            pricePerPerson: 100,
            ownerVenue: [{ owner: { cpf: "1" } }],
            contracts: [{ id: "c1" }],
            Payment: [{ amount: 10 }],
        } as ProposalPresentationRecord);

        expect(packed.images).toEqual(record.images);
        expect(packed.images[0].id).toBe("img-1");
        expect(packed.canReorder).toBe(false);
        expect(packed.catalog).toEqual([]);
        expect(packed.amenities).toEqual(record.amenities);
        expect(packed.amenities[0]).toEqual({
            name: "Piscina",
            position: 0,
            description: "Aquecida o ano todo",
            images: [
                "https://bucket.s3.region.amazonaws.com/piscina.webp",
                "https://bucket.s3.region.amazonaws.com/deck.webp",
                "https://bucket.s3.region.amazonaws.com/borda.webp",
            ],
            imageUrl: "https://bucket.s3.region.amazonaws.com/piscina.webp",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        });
        expect(packed.amenities[1]).toMatchObject({ images: [], imageUrl: null });
        expect(packed.amenities[0]).not.toHaveProperty("venueId");
        expect(packed.amenities[0]).not.toHaveProperty("id");
        expect(packed.slogan).toBe("O OASIS URBANO");
        expect(toProposalPresentation({ ...record, slogan: null }).slogan).toBeNull();
        expect(Object.keys(packed).sort()).toEqual([
            "amenities",
            "canReorder",
            "catalog",
            "checkIn",
            "checkOut",
            "city",
            "closingHour",
            "description",
            "facebookUrl",
            "faviconUrl",
            "hasOvernightStay",
            "images",
            "instagramUrl",
            "links",
            "logoUrl",
            "maxGuest",
            "minimumNights",
            "name",
            "neighborhood",
            "openingHour",
            "proposalPrimaryColor",
            "proposalSecondaryColor",
            "proposalTextColor",
            "slogan",
            "state",
            "street",
            "streetNumber",
            "tiktokUrl",
            "tourVideoUrl",
            "url",
            "whatsappNumber",
        ]);
        expect(packed.tourVideoUrl).toBe("https://cdn.example.com/tour.mp4");
        expect(packed.openingHour).toBe("08:00");
        expect(packed.closingHour).toBe("22:00");
        expect(packed.street).toBe("Rua A");
        expect(packed.streetNumber).toBe("10");
        expect(packed.state).toBe("SP");
        expect(packed).not.toHaveProperty("venueId");
        expect(packed).not.toHaveProperty("cep");
        expect(packed).not.toHaveProperty("email");
        expect(packed).not.toHaveProperty("pricePerPerson");
        expect(packed).not.toHaveProperty("ownerVenue");
        expect(packed).not.toHaveProperty("contracts");
        expect(packed).not.toHaveProperty("Payment");
    });

    it("o href sai da linha, o oculto fica de fora e o WhatsApp usa o numero atual", () => {
        const packed = toProposalPresentation({
            ...record,
            instagramUrl: "https://instagram.com/coluna",
            linkRows: [
                { kind: "INSTAGRAM", url: "https://www.instagram.com/ar756_/", visible: true, position: 0 },
                { kind: "TIKTOK", url: "https://www.tiktok.com/@ar756_", visible: false, position: 1 },
                { kind: "WHATSAPP", url: "created", visible: true, position: 2 },
            ],
            email: "casa@example.com",
            organizationUrl: "https://org.example",
        });
        expect(packed.links).toEqual([
            { kind: "INSTAGRAM", label: "Instagram", href: "https://www.instagram.com/ar756_/" },
            { kind: "WHATSAPP", label: "WhatsApp", href: "https://wa.me/19999999999" },
        ]);
        expect(packed).not.toHaveProperty("email");
        expect(packed).not.toHaveProperty("organizationUrl");
        expect(packed).not.toHaveProperty("linkRows");
        expect(packed.instagramUrl).toBe("https://instagram.com/coluna");
    });

    it("orcamento inexistente nao devolve a casa", async () => {
        const subject = useCase({ getPresentation: async () => null });

        await expect(subject.execute({ proposalId: "missing", userId: null })).rejects.toBeInstanceOf(HttpResourceNotFoundError);
    });

    it("sem token responde 200 com canReorder falso e id da foto", async () => {
        const subject = new GetProposalPresentationController(useCase({ getPresentation: async () => record }));
        const resp = responseDouble();

        await subject.handle({ params: { proposalId: "p1" }, headers: {} } as never, resp as never);

        expect(resp.statusCode).toBe(200);
        expect(resp.body?.data?.canReorder).toBe(false);
        expect(resp.body?.data?.images?.[0].id).toBe("img-1");
        expect(JSON.stringify(resp.body)).not.toContain("https://oculta");
    });

    it("sem permissao o catalogo nao e consultado e a url oculta nao sai no corpo", async () => {
        let catalogCalls = 0;
        const subject = new GetProposalPresentationController(useCase({
            getPresentation: async () => record,
            listVenueImageCatalog: async () => {
                catalogCalls += 1;
                return {
                    venueId: "venue-1",
                    images: [{ id: "hidden", imageUrl: "https://oculta", description: null, position: 9, isShowOnProposal: false }],
                };
            },
        }));
        const resp = responseDouble();

        await subject.handle({ params: { proposalId: "p1" }, headers: {} } as never, resp as never);

        expect(resp.statusCode).toBe(200);
        expect(catalogCalls).toBe(0);
        expect(JSON.stringify(resp.body)).not.toContain("https://oculta");
    });

    it("dono com permissao recebe a foto de fora do link no catalogo", async () => {
        const subject = new GetProposalPresentationController(useCase({
            getPresentation: async () => record,
            listVenueImageCatalog: async () => ({
                venueId: "venue-1",
                images: [{ id: "hidden", imageUrl: "https://oculta", description: null, position: 9, isShowOnProposal: false }],
            }),
        }, true));
        const token = sign({ id: "owner-1" }, secret);
        const resp = responseDouble();

        await subject.handle({ params: { proposalId: "p1" }, headers: { authorization: `Bearer ${token}` } } as never, resp as never);

        expect(resp.statusCode).toBe(200);
        expect(resp.body?.data?.canReorder).toBe(true);
        expect(JSON.stringify(resp.body)).toContain("https://oculta");
    });

    it("dono com permissao no espaco pode reordenar", async () => {
        const subject = new GetProposalPresentationController(useCase({ getPresentation: async () => record }, true));
        const token = sign({ id: "owner-1" }, secret);
        const resp = responseDouble();

        await subject.handle({ params: { proposalId: "p1" }, headers: { authorization: `Bearer ${token}` } } as never, resp as never);

        expect(resp.statusCode).toBe(200);
        expect(resp.body?.data?.canReorder).toBe(true);
    });

    it("autenticado sem a permissao daquele espaco nao pode reordenar", async () => {
        const subject = new GetProposalPresentationController(useCase({ getPresentation: async () => record }, false));
        const token = sign({ id: "other-1" }, secret);
        const resp = responseDouble();

        await subject.handle({ params: { proposalId: "p1" }, headers: { authorization: `Bearer ${token}` } } as never, resp as never);

        expect(resp.statusCode).toBe(200);
        expect(resp.body?.data?.canReorder).toBe(false);
    });

    it("token invalido responde 200 com canReorder falso", async () => {
        const subject = new GetProposalPresentationController(useCase({ getPresentation: async () => record }, true));
        const resp = responseDouble();

        await subject.handle({ params: { proposalId: "p1" }, headers: { authorization: "Bearer nao-e-jwt" } } as never, resp as never);

        expect(readOptionalUserId({ headers: { authorization: "Bearer nao-e-jwt" } } as never)).toBeNull();
        expect(resp.statusCode).toBe(200);
        expect(resp.body?.data?.canReorder).toBe(false);
    });

    it("a rota publica nao exige autenticacao", () => {
        const layer = proposalRoutes.stack.find((item) => item.route?.path === "/presentation/:proposalId");
        expect(layer).toBeTruthy();
        const names = layer?.route?.stack.map((handler) => handler.name) ?? [];
        expect(names).not.toContain("ensureAuthenticate");
    });

    it("a leitura pede somente fotos visiveis e o id", async () => {
        let captured: { select?: { venue?: { select?: { images?: { where?: unknown; select?: { id?: boolean } } } } } } | undefined;
        const prisma = {
            proposal: {
                findUnique: async (args: typeof captured) => {
                    captured = args;
                    return { venue: null };
                },
            },
        };
        const repository = new PrismaProposalRepository(prisma as never);

        await repository.getPresentation(oldProposalId);

        expect(captured?.select?.venue?.select?.images?.where).toEqual({ isShowOnProposal: true });
        expect(captured?.select?.venue?.select?.images?.select?.id).toBe(true);
    });

    it("a leitura pede so a url e a ordem das fotos da caracteristica", async () => {
        let captured: { select?: { venue?: { select?: { amenities?: { select?: Record<string, unknown> } } } } } | undefined;
        const prisma = {
            proposal: {
                findUnique: async (args: typeof captured) => {
                    captured = args;
                    return {
                        venue: {
                            ...record,
                            id: "venue-1",
                            images: [],
                            amenities: [{
                                name: "Piscina",
                                position: 0,
                                description: null,
                                videoUrl: null,
                                images: [{ imageUrl: "https://a" }, { imageUrl: "https://b" }],
                            }],
                        },
                    };
                },
            },
        };
        const repository = new PrismaProposalRepository(prisma as never);

        const read = await repository.getPresentation(oldProposalId);

        expect(captured?.select?.venue?.select?.amenities?.select?.images).toEqual({
            select: { imageUrl: true },
            orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        });
        expect(captured?.select?.venue?.select?.amenities?.select).not.toHaveProperty("imageUrl");
        expect(read?.amenities[0]).toMatchObject({ images: ["https://a", "https://b"], imageUrl: "https://a" });
    });

    it("codigo publico com Site devolve o catalogo e a foto de fora", async () => {
        const subject = new GetProposalPresentationUseCase(new PrismaProposalRepository(publicCodeGallery() as never), permission(true));

        const result = await subject.execute({ proposalId: "natal-k7m2abcd", userId: "owner-1" });

        expect(result.data.canReorder).toBe(true);
        expect(result.data.catalog.map((image) => image.imageUrl)).toContain("https://oculta");
        expect(result.data.images.map((image) => image.imageUrl)).not.toContain("https://oculta");
    });

    it("codigo publico sem Site ou sem usuario devolve catalogo vazio e esconde a url oculta", async () => {
        const withoutPermission = new GetProposalPresentationUseCase(new PrismaProposalRepository(publicCodeGallery() as never), permission(false));
        const anonymous = new GetProposalPresentationUseCase(new PrismaProposalRepository(publicCodeGallery() as never), permission(true));

        const denied = await withoutPermission.execute({ proposalId: "natal-k7m2abcd", userId: "other-1" });
        const guest = await anonymous.execute({ proposalId: "natal-k7m2abcd", userId: null });

        expect(denied.data.canReorder).toBe(false);
        expect(denied.data.catalog).toEqual([]);
        expect(JSON.stringify(denied.data)).not.toContain("https://oculta");
        expect(guest.data.catalog).toEqual([]);
        expect(JSON.stringify(guest.data)).not.toContain("https://oculta");
    });

    it("id antigo continua devolvendo o catalogo para quem tem Site", async () => {
        const subject = new GetProposalPresentationUseCase(new PrismaProposalRepository(publicCodeGallery() as never), permission(true));

        const result = await subject.execute({ proposalId: oldProposalId, userId: "owner-1" });

        expect(result.data.canReorder).toBe(true);
        expect(result.data.catalog.map((image) => image.id)).toEqual(["a", "hidden"]);
    });

    it("codigo inexistente responde 404", async () => {
        const subject = new GetProposalPresentationUseCase(new PrismaProposalRepository(publicCodeGallery() as never), permission(true));

        await expect(subject.execute({ proposalId: "natal-zzzzzzzz", userId: "owner-1" })).rejects.toBeInstanceOf(HttpResourceNotFoundError);
    });
});

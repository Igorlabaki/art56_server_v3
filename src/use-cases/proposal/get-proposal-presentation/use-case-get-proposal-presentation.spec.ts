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
    logoUrl: "https://logo",
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
    amenities: [{ name: "Piscina", position: 0 }],
};

function permission(allowed: boolean): VenueSiteEditPermission {
    return { canEditVenueSite: async () => allowed };
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

        await repository.getPresentation("p1");

        expect(captured?.select?.venue?.select?.images?.where).toEqual({ isShowOnProposal: true });
        expect(captured?.select?.venue?.select?.images?.select?.id).toBe(true);
    });
});

import { describe, expect, it } from "vitest";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { PrismaProposalIndicationRepository } from "../../../repositories/in-prisma/proposal-indication-in-prisma-repository";
import { PublicIndication } from "../../../repositories/interface/proposal-indication-repository-interface";
import { proposalRoutes } from "../../../router/proposal";
import { ListProposalIndicationsUseCase } from "./use-case-list-proposal-indications";

function indication(id: string, extra?: Record<string, unknown>): PublicIndication {
    return {
        id,
        name: id,
        role: "Foto",
        whatsapp: "+5511888888888",
        email: "foto@example.com",
        instagramUrl: "https://instagram.com/foto",
        facebookUrl: null,
        tiktokUrl: null,
        url: "https://foto.example",
        category: "FOTOGRAFIA",
        logoUrl: null,
        description: null,
        ...extra,
    } as PublicIndication;
}

function harness(options?: { proposal?: { id: string; venueId: string; organizationId: string } | null; rows?: PublicIndication[] }) {
    const proposal = options && "proposal" in options
        ? options.proposal ?? null
        : { id: "proposal-1", venueId: "venue-1", organizationId: "org-1" };
    const listCalls: { proposalId: string; venueId: string }[] = [];
    const useCase = new ListProposalIndicationsUseCase({
        findProposal: async () => proposal,
        list: async (proposalId, venueId) => {
            listCalls.push({ proposalId, venueId });
            return options?.rows ?? [];
        },
    });
    return { useCase, listCalls };
}

describe("ler indicacoes publicas", () => {
    it("GET nao exige autenticacao", () => {
        const layer = proposalRoutes.stack.find((item) => item.route?.path === "/indications/:proposalId" && item.route.methods.get);
        const names = layer?.route?.stack.map((handler) => handler.name) ?? [];
        expect(names).not.toContain("ensureAuthenticate");
    });

    it("devolve so os campos publicos na ordem recebida", async () => {
        const rows = [
            indication("primeiro", { venueId: "venue-1", type: "TEAM_MEMBER", internalNote: "interna" }),
            indication("segundo", { description: "Bolos finos", logoUrl: "https://cdn.example/logo.webp" }),
        ];
        const { useCase } = harness({ rows });
        const result = await useCase.execute("proposal-1");
        expect(result.data.indications.map((item) => item.id)).toEqual(["primeiro", "segundo"]);
        const serialized = JSON.stringify(result.data.indications);
        expect(serialized).not.toContain("TEAM_MEMBER");
        expect(serialized).not.toContain("venue-1");
        expect(serialized).not.toContain("interna");
        expect(serialized).toContain("Bolos finos");
        expect(result.data.indications[1]).toEqual({
            id: "segundo",
            name: "segundo",
            role: "Foto",
            whatsapp: "+5511888888888",
            email: "foto@example.com",
            instagramUrl: "https://instagram.com/foto",
            facebookUrl: null,
            tiktokUrl: null,
            url: "https://foto.example",
            category: "FOTOGRAFIA",
            logoUrl: "https://cdn.example/logo.webp",
            description: "Bolos finos",
        });
    });

    it("orcamento sem vinculo responde lista vazia", async () => {
        const { useCase, listCalls } = harness({ rows: [] });
        const result = await useCase.execute("proposal-1");
        expect(result.success).toBe(true);
        expect(result.data.indications).toEqual([]);
        expect(listCalls).toEqual([{ proposalId: "proposal-1", venueId: "venue-1" }]);
    });

    it("a leitura pede so fornecedor do espaco, na ordem, e ignora contato apagado", async () => {
        const queries: { where?: unknown; orderBy?: unknown; select?: unknown }[] = [];
        const prisma = {
            proposalIndication: {
                findMany: async (args: { where?: unknown; orderBy?: unknown; select?: unknown }) => {
                    queries.push(args);
                    return [];
                },
            },
        };
        const repository = new PrismaProposalIndicationRepository(prisma as never);
        await repository.list("proposal-1", "venue-1");
        expect(queries[0]).toMatchObject({
            where: {
                proposalId: "proposal-1",
                contact: { type: "SUPPLIER", venueId: "venue-1" },
            },
            orderBy: { position: "asc" },
            select: {
                contact: {
                    select: expect.objectContaining({
                        logoUrl: true,
                        description: true,
                    }),
                },
            },
        });
    });

    it("orcamento inexistente responde 404", async () => {
        const { useCase, listCalls } = harness({ proposal: null });
        await expect(useCase.execute("ausente")).rejects.toBeInstanceOf(HttpResourceNotFoundError);
        expect(listCalls).toHaveLength(0);
    });
});

import { describe, expect, it } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { ProposalRepositoryInterface, VenueImagesForReorder } from "../../../repositories/interface/proposal-repository-interface";
import { VenueSiteEditPermission } from "../../../repositories/interface/venue-site-edit-permission-interface";
import { proposalRoutes } from "../../../router/proposal";
import { ReorderProposalImagesUseCase } from "./use-case-reorder-proposal-images";

const images: VenueImagesForReorder = {
    venueId: "venue-1",
    visible: [
        { id: "a", imageUrl: "https://a", description: null, position: 1 },
        { id: "c", imageUrl: "https://c", description: null, position: 4 },
    ],
    hiddenPositions: [2],
};

function harness(allowed = true, current: VenueImagesForReorder | null = images) {
    const updates: { id: string; position: number }[][] = [];
    const repository = {
        listVenueImagesForReorder: async () => current,
        applyImagePositions: async (next: { id: string; position: number }[]) => {
            updates.push(next);
        },
    } as unknown as ProposalRepositoryInterface;
    const permission: VenueSiteEditPermission = { canEditVenueSite: async () => allowed };
    return {
        updates,
        useCase: new ReorderProposalImagesUseCase(repository, permission),
    };
}

describe("gravar ordem das fotos visiveis", () => {
    it("sem token responde 401 e nao grava", async () => {
        const { useCase, updates } = harness();

        await expect(useCase.execute({ proposalId: "p1", imageIds: ["c", "a"], userId: null })).rejects.toBeInstanceOf(HttpTokenError);
        expect(updates).toHaveLength(0);
    });

    it("autenticado sem a permissao daquele espaco responde 403 e nao grava", async () => {
        const { useCase, updates } = harness(false);

        await expect(useCase.execute({ proposalId: "p1", imageIds: ["c", "a"], userId: "user-2" })).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(updates).toHaveLength(0);
    });

    it("conjunto diferente ou ids repetidos responde 400 e nao grava", async () => {
        const { useCase, updates } = harness();

        await expect(useCase.execute({ proposalId: "p1", imageIds: ["a", "a"], userId: "user-1" })).rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(useCase.execute({ proposalId: "p1", imageIds: ["a", "outra"], userId: "user-1" })).rejects.toBeInstanceOf(HttpBadRequestError);
        expect(updates).toHaveLength(0);
    });

    it("ordem nova grava as posicoes na ordem enviada e preserva a foto oculta", async () => {
        const { useCase, updates } = harness();

        const result = await useCase.execute({ proposalId: "p1", imageIds: ["c", "a"], userId: "user-1" });

        expect(result.data.images.map((image) => [image.id, image.position])).toEqual([
            ["c", 1],
            ["a", 3],
        ]);
        expect(updates).toEqual([[{ id: "c", position: 1 }, { id: "a", position: 3 }]]);
        expect(updates[0].some((item) => item.position === 2)).toBe(false);
    });

    it("a mesma ordem responde 200 sem gravar", async () => {
        const { useCase, updates } = harness();

        const result = await useCase.execute({ proposalId: "p1", imageIds: ["a", "c"], userId: "user-1" });

        expect(result.success).toBe(true);
        expect(updates).toHaveLength(0);
    });

    it("a gravacao exige autenticacao e escreve por id dentro da transacao", async () => {
        const layer = proposalRoutes.stack.find((item) => item.route?.path === "/presentation/:proposalId/image-order");
        const names = layer?.route?.stack.map((handler) => handler.name) ?? [];
        expect(names).toContain("ensureAuthenticate");

        const calls: string[] = [];
        const prisma = {
            $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
            image: {
                update: (args: { where: { id: string } }) => {
                    calls.push(args.where.id);
                    return Promise.resolve({});
                },
            },
        };
        const repository = new PrismaProposalRepository(prisma as never);

        await repository.applyImagePositions([
            { id: "b", position: 1 },
            { id: "a", position: 2 },
        ]);

        expect(calls).toEqual(["a", "b"]);
    });
});

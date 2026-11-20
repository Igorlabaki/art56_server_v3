import { describe, expect, it } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { ImageChoiceUpdate, ProposalRepositoryInterface, VenueImagesForChoice } from "../../../repositories/interface/proposal-repository-interface";
import { VenueSiteEditPermission } from "../../../repositories/interface/venue-site-edit-permission-interface";
import { proposalRoutes } from "../../../router/proposal";
import { ChooseProposalImageUseCase } from "./use-case-choose-proposal-image";

const catalog: VenueImagesForChoice = {
    venueId: "venue-1",
    images: [
        { id: "a", imageUrl: "https://a", description: null, position: 1, isShowOnProposal: true },
        { id: "hidden", imageUrl: "https://oculta", description: null, position: 2, isShowOnProposal: false },
        { id: "b", imageUrl: "https://b", description: null, position: 4, isShowOnProposal: true },
    ],
};

function harness(allowed = true, current: VenueImagesForChoice | null = catalog) {
    const updates: ImageChoiceUpdate[][] = [];
    const repository = {
        listVenueImageCatalog: async () => current,
        applyImageChoice: async (next: ImageChoiceUpdate[]) => {
            updates.push(next);
        },
    } as unknown as ProposalRepositoryInterface;
    const permission: VenueSiteEditPermission = { canEditVenueSite: async () => allowed };
    return {
        updates,
        useCase: new ChooseProposalImageUseCase(repository, permission),
    };
}

describe("trocar a foto do link", () => {
    it("sem token responde 401 e nao grava", async () => {
        const { useCase, updates } = harness();

        await expect(useCase.execute({ proposalId: "p1", slotId: "a", replacementId: "hidden", userId: null })).rejects.toBeInstanceOf(HttpTokenError);
        expect(updates).toHaveLength(0);
    });

    it("autenticado sem a permissao daquele espaco responde 403 e nao grava", async () => {
        const { useCase, updates } = harness(false);

        await expect(useCase.execute({ proposalId: "p1", slotId: "a", replacementId: "hidden", userId: "user-2" })).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(updates).toHaveLength(0);
    });

    it("orcamento inexistente responde 404 e nao grava", async () => {
        const { useCase, updates } = harness(true, null);

        await expect(useCase.execute({ proposalId: "missing", slotId: "a", replacementId: "hidden", userId: "user-1" })).rejects.toBeInstanceOf(HttpResourceNotFoundError);
        expect(updates).toHaveLength(0);
    });

    it("foto de outro espaco ou origem fora do link responde 400 e nao grava", async () => {
        const { useCase, updates } = harness();

        await expect(useCase.execute({ proposalId: "p1", slotId: "a", replacementId: "alheia", userId: "user-1" })).rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(useCase.execute({ proposalId: "p1", slotId: "hidden", replacementId: "a", userId: "user-1" })).rejects.toBeInstanceOf(HttpBadRequestError);
        expect(updates).toHaveLength(0);
    });

    it("a mesma foto responde 200 sem gravar", async () => {
        const { useCase, updates } = harness();

        const result = await useCase.execute({ proposalId: "p1", slotId: "a", replacementId: "a", userId: "user-1" });

        expect(result.success).toBe(true);
        expect(updates).toHaveLength(0);
    });

    it("foto de fora do link entra no lugar e a anterior sai", async () => {
        const { useCase, updates } = harness();

        const result = await useCase.execute({ proposalId: "p1", slotId: "a", replacementId: "hidden", userId: "user-1" });

        expect(result.data.images.map((image) => [image.id, image.position])).toEqual([
            ["hidden", 1],
            ["b", 4],
        ]);
        expect(updates).toEqual([[
            { id: "a", position: 2, isShowOnProposal: false },
            { id: "hidden", position: 1, isShowOnProposal: true },
        ]]);
        expect(result.data.catalog.find((image) => image.id === "b")?.isShowOnProposal).toBe(true);
    });

    it("duas fotos do link trocam de lugar e continuam visiveis", async () => {
        const { useCase, updates } = harness();

        const result = await useCase.execute({ proposalId: "p1", slotId: "a", replacementId: "b", userId: "user-1" });

        expect(result.data.images.map((image) => [image.id, image.position])).toEqual([
            ["b", 1],
            ["a", 4],
        ]);
        expect(updates).toEqual([[
            { id: "a", position: 4, isShowOnProposal: true },
            { id: "b", position: 1, isShowOnProposal: true },
        ]]);
    });

    it("a gravacao exige autenticacao e escreve por id dentro da transacao", async () => {
        const layer = proposalRoutes.stack.find((item) => item.route?.path === "/presentation/:proposalId/image-choice");
        const names = layer?.route?.stack.map((handler) => handler.name) ?? [];
        expect(names).toContain("ensureAuthenticate");

        const calls: { id: string; data: Record<string, unknown> }[] = [];
        const prisma = {
            $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
            image: {
                update: (args: { where: { id: string }; data: Record<string, unknown> }) => {
                    calls.push({ id: args.where.id, data: args.data });
                    return Promise.resolve({});
                },
            },
        };
        const repository = new PrismaProposalRepository(prisma as never);

        await repository.applyImageChoice([
            { id: "b", position: 1, isShowOnProposal: true },
            { id: "a", position: 2, isShowOnProposal: false },
        ]);

        expect(calls.map((call) => call.id)).toEqual(["a", "b"]);
        expect(calls[0].data).toEqual({ position: 2, isShowOnProposal: false });
        expect(calls[0].data).not.toHaveProperty("isShowOnOrganization");
    });

    it("codigo publico com Site grava a troca e sem Site ou sem token nao grava", async () => {
        const images = [
            { id: "a", imageUrl: "https://a", description: null, position: 1, isShowOnProposal: true },
            { id: "hidden", imageUrl: "https://oculta", description: null, position: 2, isShowOnProposal: false },
        ];
        const writes: string[] = [];
        const prisma = {
            proposal: {
                findUnique: async (args: { where: { id?: string; publicCode?: string }; select?: { venue?: unknown } }) => {
                    if (args.where.publicCode === "k7m2abcd" && !args.select?.venue) return { id: "real-id" };
                    if (args.where.publicCode === "zzzzzzzz") return null;
                    if (args.where.id === "real-id" || args.where.id === "7a6974ae-d08f-4b9b-97a4-ccf3998aa7e7") {
                        return { venue: { id: "venue-1", images } };
                    }
                    return null;
                },
            },
            $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
            image: {
                update: (args: { where: { id: string } }) => {
                    writes.push(args.where.id);
                    return Promise.resolve({});
                },
            },
        };
        const repository = () => new PrismaProposalRepository(prisma as never);
        const allowed: VenueSiteEditPermission = { canEditVenueSite: async () => true };
        const denied: VenueSiteEditPermission = { canEditVenueSite: async () => false };

        const saved = await new ChooseProposalImageUseCase(repository(), allowed).execute({
            proposalId: "natal-k7m2abcd",
            slotId: "a",
            replacementId: "hidden",
            userId: "user-1",
        });
        expect(saved.data.images.map((image) => image.id)).toEqual(["hidden"]);
        expect(writes).toEqual(["a", "hidden"]);

        const oldId = await new ChooseProposalImageUseCase(repository(), allowed).execute({
            proposalId: "7a6974ae-d08f-4b9b-97a4-ccf3998aa7e7",
            slotId: "a",
            replacementId: "hidden",
            userId: "user-1",
        });
        expect(oldId.data.images.map((image) => image.id)).toEqual(["hidden"]);

        writes.length = 0;
        await expect(new ChooseProposalImageUseCase(repository(), denied).execute({
            proposalId: "natal-k7m2abcd",
            slotId: "a",
            replacementId: "hidden",
            userId: "user-2",
        })).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(new ChooseProposalImageUseCase(repository(), allowed).execute({
            proposalId: "natal-k7m2abcd",
            slotId: "a",
            replacementId: "hidden",
            userId: null,
        })).rejects.toBeInstanceOf(HttpTokenError);
        await expect(new ChooseProposalImageUseCase(repository(), allowed).execute({
            proposalId: "natal-zzzzzzzz",
            slotId: "a",
            replacementId: "hidden",
            userId: "user-1",
        })).rejects.toBeInstanceOf(HttpResourceNotFoundError);
        expect(writes).toHaveLength(0);
    });
});

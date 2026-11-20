import { describe, expect, it } from "vitest";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../../errors/errors-type/http-token-error";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { VenueSiteEditPermission } from "../../../repositories/interface/venue-site-edit-permission-interface";
import { ChooseVenueImageUseCase } from "../choose-venue-image/use-case-choose-venue-image";
import { ReorderVenueImagesUseCase } from "./use-case-reorder-venue-images";

const venueUuid = "8159e209-0057-4df3-ae72-855363c3b84e";

function gallery() {
    const images = [
        { id: "a", imageUrl: "https://a", description: null, position: 1, isShowOnProposal: true },
        { id: "hidden", imageUrl: "https://oculta", description: null, position: 2, isShowOnProposal: false },
        { id: "b", imageUrl: "https://b", description: null, position: 4, isShowOnProposal: true },
    ];
    const writes: string[] = [];
    const prisma = {
        venue: {
            findUnique: async (args: { where: { id?: string; name?: string }; select?: { images?: { where?: unknown } } }) => {
                const key = args.where.id ?? args.where.name;
                if (key !== "Casa Aurora" && key !== venueUuid) return null;
                return { id: "venue-1", images };
            },
        },
        $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
        image: {
            update: (args: { where: { id: string }; data: { position?: number; isShowOnProposal?: boolean } }) => {
                const image = images.find((item) => item.id === args.where.id);
                if (image) Object.assign(image, args.data);
                writes.push(args.where.id);
                return Promise.resolve({});
            },
        },
    };
    const venues = new PrismaVenueRepository(prisma as never);
    const stored = new PrismaProposalRepository(prisma as never);
    const allow: VenueSiteEditPermission = { canEditVenueSite: async () => true };
    const deny: VenueSiteEditPermission = { canEditVenueSite: async () => false };
    return { images, writes, venues, stored, allow, deny };
}

describe("editar fotos da apresentacao do espaco", () => {
    it("sem token o PUT responde 401 sem gravar", async () => {
        const { writes, venues, stored, allow } = gallery();

        await expect(new ReorderVenueImagesUseCase(venues, stored, allow).execute({
            venueKey: "Casa Aurora",
            imageIds: ["b", "a"],
            userId: null,
        })).rejects.toBeInstanceOf(HttpTokenError);
        await expect(new ChooseVenueImageUseCase(venues, stored, allow).execute({
            venueKey: "Casa Aurora",
            slotId: "a",
            replacementId: "hidden",
            userId: null,
        })).rejects.toBeInstanceOf(HttpTokenError);
        expect(writes).toHaveLength(0);
    });

    it("token sem Site responde 403 e nao grava", async () => {
        const { writes, venues, stored, deny } = gallery();

        await expect(new ReorderVenueImagesUseCase(venues, stored, deny).execute({
            venueKey: "Casa Aurora",
            imageIds: ["b", "a"],
            userId: "user-2",
        })).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(new ChooseVenueImageUseCase(venues, stored, deny).execute({
            venueKey: venueUuid,
            slotId: "a",
            replacementId: "hidden",
            userId: "user-2",
        })).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(writes).toHaveLength(0);
    });

    it("com Site a troca e a ordem gravam e a leitura seguinte mostra o resultado", async () => {
        const { images, venues, stored, allow } = gallery();
        const choice = new ChooseVenueImageUseCase(venues, stored, allow);
        const reorder = new ReorderVenueImagesUseCase(venues, stored, allow);

        const swapped = await choice.execute({
            venueKey: "Casa Aurora",
            slotId: "a",
            replacementId: "hidden",
            userId: "owner-1",
        });
        expect(swapped.data.images.map((image) => image.id)).toContain("hidden");
        expect(images.find((image) => image.id === "hidden")?.isShowOnProposal).toBe(true);

        const again = await venues.listImageCatalog("Casa Aurora");
        expect(again?.images.find((image) => image.id === "a")?.isShowOnProposal).toBe(false);

        const moved = await reorder.execute({
            venueKey: venueUuid,
            imageIds: ["b", "hidden"],
            userId: "owner-1",
        });
        expect(moved.data.images.map((image) => image.id)).toEqual(["b", "hidden"]);
    });

    it("lista que nao bate ou foto de outro espaco responde 400 e nao grava", async () => {
        const { writes, venues, stored, allow } = gallery();

        await expect(new ReorderVenueImagesUseCase(venues, stored, allow).execute({
            venueKey: "Casa Aurora",
            imageIds: ["a", "alheia"],
            userId: "owner-1",
        })).rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(new ChooseVenueImageUseCase(venues, stored, allow).execute({
            venueKey: "Casa Aurora",
            slotId: "a",
            replacementId: "alheia",
            userId: "owner-1",
        })).rejects.toBeInstanceOf(HttpBadRequestError);
        expect(writes).toHaveLength(0);
    });

    it("espaco inexistente responde 404", async () => {
        const { venues, stored, allow } = gallery();

        await expect(new ChooseVenueImageUseCase(venues, stored, allow).execute({
            venueKey: "Casa Ausente",
            slotId: "a",
            replacementId: "hidden",
            userId: "owner-1",
        })).rejects.toBeInstanceOf(HttpResourceNotFoundError);
    });
});

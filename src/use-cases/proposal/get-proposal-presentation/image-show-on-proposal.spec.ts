import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { planVisibleImagePositions } from "../../../functions/plan-visible-image-positions";
import { PrismaOrganizationRepository } from "../../../repositories/in-prisma/organization-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

describe("marca da foto no link de orcamento", () => {
    it("foto so do site fica fora do link e a reordenacao nao usa a posicao dela", async () => {
        const prisma = {
            proposal: {
                findUnique: async () => ({
                    venue: {
                        id: "venue-1",
                        images: [
                            { id: "link-b", imageUrl: "https://b", description: null, position: 4, isShowOnOrganization: false, isShowOnProposal: true },
                            { id: "site-only", imageUrl: "https://site", description: null, position: 2, isShowOnOrganization: true, isShowOnProposal: false },
                            { id: "link-a", imageUrl: "https://a", description: null, position: 1, isShowOnOrganization: true, isShowOnProposal: true },
                        ],
                    },
                }),
            },
        };
        const repository = new PrismaProposalRepository(prisma as never);

        const listed = await repository.listVenueImagesForReorder("p1");

        expect(listed?.visible.map((image) => image.id)).toEqual(["link-a", "link-b"]);
        expect(listed?.hiddenPositions).toEqual([2]);
        const planned = planVisibleImagePositions(listed!.visible, listed!.hiddenPositions, ["link-b", "link-a"]);
        expect(planned.ok).toBe(true);
        if (planned.ok && planned.changed) {
            expect(planned.updates.some((item) => item.position === 2)).toBe(false);
            expect(planned.updates.map((item) => item.id)).not.toContain("site-only");
        }
    });

    it("atualizar as fotos do site nao grava a marca do link", async () => {
        const writes: Record<string, unknown>[] = [];
        const prisma = {
            image: {
                findMany: async () => [{ id: "a" }, { id: "b" }],
                updateMany: async (args: { data: Record<string, unknown> }) => {
                    writes.push(args.data);
                    return { count: 1 };
                },
            },
            organization: {
                findFirst: async () => ({ id: "org" }),
            },
        };
        const repository = new PrismaOrganizationRepository(prisma as never);

        await repository.updateImages({ organizationId: "org", venueId: "venue-1", imageids: ["a"] });

        expect(writes).toEqual([{ isShowOnOrganization: true }, { isShowOnOrganization: false }]);
        for (const data of writes) {
            expect(data).not.toHaveProperty("isShowOnProposal");
        }
    });

    it("a migration adiciona a coluna nullable e copia a marca do site sem apaga-la", () => {
        const sql = readFileSync(
            resolve(process.cwd(), "prisma/migrations/20261104181600_add_image_is_show_on_proposal/migration.sql"),
            "utf8"
        );

        expect(sql).toContain("ADD COLUMN `isShowOnProposal` BOOLEAN NULL");
        expect(sql).toContain("UPDATE `image` SET `isShowOnProposal` = true WHERE `isShowOnOrganization` = true");
        expect(sql).not.toMatch(/DROP\s+COLUMN\s+`isShowOnOrganization`/i);
        expect(sql).not.toMatch(/SET\s+`isShowOnOrganization`/i);
    });
});

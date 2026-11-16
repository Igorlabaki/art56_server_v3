import { describe, expect, it } from "vitest";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { ListPermittedVenuesUseCase } from "./use-case-list-permitted-venue";

const BRAND_FIELDS = ["logoUrl", "proposalPrimaryColor", "proposalSecondaryColor", "proposalTextColor"];

function prismaCapturing(rows: Record<string, unknown>[]) {
    const calls: Array<{ select: Record<string, unknown> }> = [];
    const prisma = {
        venue: {
            findMany: async (args: { select: Record<string, unknown> }) => {
                calls.push(args);
                return rows;
            },
        },
    };
    return { prisma, calls };
}

describe("GET /venue/permittedVenueList com a marca do espaco", () => {
    it("pede ao banco o logo e as tres cores do espaco", async () => {
        const { prisma, calls } = prismaCapturing([]);
        const repository = new PrismaVenueRepository(prisma as never);

        await repository.listPermitted({ organizationId: "org-1", userId: "user-1" });

        for (const field of BRAND_FIELDS) {
            expect(calls[0].select[field]).toBe(true);
        }
    });

    it("a lista geral de espacos pede os mesmos campos de marca", async () => {
        const { prisma, calls } = prismaCapturing([]);
        const repository = new PrismaVenueRepository(prisma as never);

        await repository.list({ organizationId: "org-1" });

        for (const field of BRAND_FIELDS) {
            expect(calls[0].select[field]).toBe(true);
        }
    });

    it("devolve o logo e as cores na resposta, nulos quando o espaco nao configurou", async () => {
        const { prisma } = prismaCapturing([
            {
                id: "venue-1",
                name: "AR756",
                logoUrl: "https://cdn.example/ar756.webp",
                proposalPrimaryColor: "#112233",
                proposalSecondaryColor: "#445566",
                proposalTextColor: "#f7f7f5",
            },
            {
                id: "venue-2",
                name: "Guaeca House",
                logoUrl: null,
                proposalPrimaryColor: null,
                proposalSecondaryColor: null,
                proposalTextColor: null,
            },
        ]);
        const useCase = new ListPermittedVenuesUseCase(new PrismaVenueRepository(prisma as never));

        const response = await useCase.execute({ organizationId: "org-1", userId: "user-1" });

        expect(response.data.venueList?.[0]).toMatchObject({
            logoUrl: "https://cdn.example/ar756.webp",
            proposalPrimaryColor: "#112233",
            proposalSecondaryColor: "#445566",
            proposalTextColor: "#f7f7f5",
        });
        expect(response.data.venueList?.[1]).toMatchObject({
            logoUrl: null,
            proposalPrimaryColor: null,
            proposalSecondaryColor: null,
            proposalTextColor: null,
        });
    });
});

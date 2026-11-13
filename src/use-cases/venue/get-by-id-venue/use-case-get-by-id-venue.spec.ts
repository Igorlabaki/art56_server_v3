import { describe, expect, it } from "vitest";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { GetVenueByIdUseCase } from "./use-case-get-by-id-venue";

function prismaCapturing(row: Record<string, unknown>) {
    const calls: Array<{ include: Record<string, unknown> }> = [];
    const prisma = {
        venue: {
            findFirst: async (args: { include: Record<string, unknown> }) => {
                calls.push(args);
                return row;
            },
        },
    };
    return { prisma, calls };
}

describe("GET /venue/getById sem dados do proprietario", () => {
    it("pede ao banco so os ids do vinculo com o proprietario", async () => {
        const { prisma, calls } = prismaCapturing({ id: "venue-1", name: "Casa", ownerVenue: [] });
        const repository = new PrismaVenueRepository(prisma as never);

        await repository.getSelectedVenue({ venueId: "venue-1" });

        expect(calls[0].include.ownerVenue).toEqual({ select: { ownerId: true, venueId: true } });
    });

    it("sem userId a resposta publica nao traz CPF, PIX, banco nem CNPJ", async () => {
        const { prisma } = prismaCapturing({
            id: "venue-1",
            name: "Casa",
            ownerVenue: [{ ownerId: "owner-1", venueId: "venue-1" }],
        });
        const useCase = new GetVenueByIdUseCase(new PrismaVenueRepository(prisma as never));

        const response = await useCase.execute({ venueId: "venue-1" });
        const body = JSON.stringify(response);

        expect((response.data as unknown as { ownerVenue: unknown }).ownerVenue).toEqual([{ ownerId: "owner-1", venueId: "venue-1" }]);
        for (const field of ["owner\"", "cpf", "pix", "bankAccountNumber", "cnpj", "companyName"]) {
            expect(body).not.toContain(field);
        }
    });
});

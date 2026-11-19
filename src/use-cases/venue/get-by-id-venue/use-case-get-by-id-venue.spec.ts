import { describe, expect, it } from "vitest";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { GetVenueByIdUseCase } from "./use-case-get-by-id-venue";

function prismaCapturing(row: Record<string, unknown>) {
    const calls: Array<{ include: Record<string, unknown> }> = [];
    const prisma = {
        venue: {
            findUnique: async () => ({ id: "venue-1" }),
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

const VENUE_UUID = "8159e209-0057-4df3-ae72-855363c3b84e";

describe("GET /venue/getById pelo nome do espaco", () => {
    function capture() {
        const unique: Array<{ where: unknown; select?: unknown }> = [];
        const first: Array<{ where: { id: string }; include: Record<string, unknown> }> = [];
        let named: { id: string } | null = { id: "real-id" };
        const prisma = {
            venue: {
                findUnique: async (args: { where: unknown; select?: unknown }) => {
                    unique.push(args);
                    return named;
                },
                findFirst: async (args: { where: { id: string }; include: Record<string, unknown> }) => {
                    first.push(args);
                    return { id: args.where.id, name: "Casa Norte", ownerVenue: [] };
                },
            },
        };
        return {
            prisma,
            unique,
            first,
            miss() {
                named = null;
            },
        };
    }

    it("sem userId acha a casa pelo nome e segue o include atual", async () => {
        const { prisma, unique, first } = capture();
        const repository = new PrismaVenueRepository(prisma as never);

        const venue = await repository.getSelectedVenue({ venueId: "Casa Norte" });

        expect(unique).toEqual([{ where: { name: "Casa Norte" }, select: { id: true } }]);
        expect(first[0].where.id).toBe("real-id");
        expect(venue).toMatchObject({ id: "real-id" });
        expect(Object.keys(first[0].include).sort()).toEqual(
            ["attachments", "contracts", "ownerVenue", "userVenuePermissions"],
        );
        expect(first[0].include.ownerVenue).toEqual({ select: { ownerId: true, venueId: true } });
    });

    it("UUID busca so por id", async () => {
        const { prisma, unique, first } = capture();
        const repository = new PrismaVenueRepository(prisma as never);

        await repository.getSelectedVenue({ venueId: VENUE_UUID });

        expect(unique).toEqual([]);
        expect(first[0].where.id).toBe(VENUE_UUID);
    });

    it("com userId um nome nao busca name", async () => {
        const { prisma, unique, first } = capture();
        const repository = new PrismaVenueRepository(prisma as never);

        await repository.getSelectedVenue({ venueId: "Casa Norte", userId: "user-1" });

        expect(unique).toEqual([]);
        expect(first[0].where.id).toBe("Casa Norte");
    });

    it("nome ausente devolve 404 e nao consulta outro id", async () => {
        const captured = capture();
        captured.miss();
        const useCase = new GetVenueByIdUseCase(new PrismaVenueRepository(captured.prisma as never));

        await expect(useCase.execute({ venueId: "Casa Norte" })).rejects.toBeInstanceOf(HttpResourceNotFoundError);
        expect(captured.first).toEqual([]);
    });
});

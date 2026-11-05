import { describe, expect, it } from "vitest";
import { HttpStandartError } from "../../../errors/errors-type/htttp-standart-error";
import { PersonRepositoryInterface } from "../../../repositories/interface/person-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";
import { CreateManyPersonSchema } from "../../../zod/person/create-many-person-params-schema";
import { CreateManyPersonUseCase } from "./use-case-create-many-person";

function proposal(guestNumber: number, guests: number, workers = 0) {
    return {
        id: "p1",
        guestNumber,
        personList: [
            ...Array.from({ length: guests }, (_, index) => ({ id: `g${index}`, type: "GUEST" })),
            ...Array.from({ length: workers }, (_, index) => ({ id: `w${index}`, type: "WORKER" })),
        ],
    };
}

function harness(current: ReturnType<typeof proposal> | null) {
    const created: CreateManyPersonSchema[] = [];
    const personRepository = {
        createMany: async (people: CreateManyPersonSchema) => {
            created.push(people);
            return { count: people.length, list: people };
        },
    } as unknown as PersonRepositoryInterface;
    const proposalRepository = {
        getById: async () => current,
    } as unknown as ProposalRepositoryInterface;
    return {
        created,
        useCase: new CreateManyPersonUseCase(personRepository, proposalRepository),
    };
}

const worker = { name: "Bruno", proposalId: "p1", type: "WORKER" as const };
const guest = { name: "Ana", proposalId: "p1", type: "GUEST" as const };

describe("gravar pessoas com a lista de convidados cheia", () => {
    it("grava colaborador e nao abre vaga de convidado", async () => {
        const { useCase, created } = harness(proposal(2, 2, 3));

        const saved = await useCase.execute([worker]);

        expect(saved.success).toBe(true);
        expect(created).toEqual([[worker]]);
        await expect(useCase.execute([guest])).rejects.toBeInstanceOf(HttpStandartError);
        expect(created).toEqual([[worker]]);
    });

    it("recusa convidado quando a lista ja passou do numero", async () => {
        const { useCase, created } = harness(proposal(2, 3));

        await expect(useCase.execute([guest])).rejects.toThrow("Nao ha mais vaga na lista de convidados");
        expect(created).toHaveLength(0);
    });

    it("no lote misto, grava so o colaborador", async () => {
        const { useCase, created } = harness(proposal(2, 2));

        await useCase.execute([guest, worker]);

        expect(created).toEqual([[worker]]);
    });

    it("com vaga, grava convidado mesmo com colaboradores ja salvos", async () => {
        const { useCase, created } = harness(proposal(2, 1, 5));

        await useCase.execute([guest, worker]);

        expect(created).toEqual([[guest, worker]]);
    });
});

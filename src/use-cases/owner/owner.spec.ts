import { describe, expect, it } from "vitest";
import { HttpConflictError } from "../../errors/errors-type/htttp-conflict-error";
import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../errors/errors-type/http-token-error";
import { PrismaOwnerRepository } from "../../repositories/in-prisma/owner-in-prisma-repository";
import { FindOwnerDuplicateParams, OwnerRepositoryInterface } from "../../repositories/interface/owner-repository-interface";
import { updateOwnerSchema } from "../../zod/owner/update-owner-params-schema";
import { CreateOrganizationOwnerUseCase } from "./create-organization-owner/use-case-create-organition-owner";
import { CreateVenueOwnerUseCase } from "./create-venue-owner/use-case-create-venue-owner";
import { DeleteOwnerUseCase } from "./delete-owner/use-case-delete-owner";
import { ListOwnerByVenueIdUseCase } from "./list-by-venue-owners/use-case-list-by-venueId-owners";
import { ListOwnerUseCase } from "./list-owners/use-case-list-owners";
import { OWNER_ORGANIZATION_FORBIDDEN, OWNER_VENUE_FORBIDDEN, OwnerAuthorizer } from "./owner-authorizer";
import { UpdateOwnerUseCase } from "./update-owner/use-case-update-owner";

type Row = Record<string, unknown> & { id: string; organizationId: string; completeName: string };

const memberships: Record<string, string[]> = { "user-a": ["org-a"], "user-b": ["org-b"] };
const venueOrganization: Record<string, string> = { "venue-a1": "org-a", "venue-a2": "org-a", "venue-b1": "org-b" };

class FakeOwnerRepository implements OwnerRepositoryInterface {
    rows: Row[] = [];
    links: Array<{ ownerId: string; venueId: string }> = [];
    writes = 0;

    private insert(params: Record<string, unknown>, venueIds: string[]) {
        this.writes += 1;
        const row = { id: `owner-${this.rows.length + 1}`, personType: "PF", companyName: null, cnpj: null, companySize: null, ...params } as unknown as Row;
        this.rows.push(row);
        for (const venueId of venueIds) this.links.push({ ownerId: row.id, venueId });
        return row as never;
    }

    async createOrganizationOwner({ venueIds, ...params }: { venueIds?: string[] } & Record<string, unknown>) {
        return this.insert(params, venueIds ?? []);
    }

    async createVenueOwner({ venueId, ...params }: { venueId: string } & Record<string, unknown>) {
        return this.insert(params, [venueId]);
    }

    async update({ ownerId, data: { venueIds, ...rest } }: { ownerId: string; data: { venueIds?: string[] } & Record<string, unknown> }) {
        this.writes += 1;
        const row = this.rows.find((item) => item.id === ownerId);
        if (!row) return null;
        Object.assign(row, rest);
        if (venueIds !== undefined) {
            this.links = this.links.filter((link) => link.ownerId !== ownerId);
            for (const venueId of venueIds) this.links.push({ ownerId, venueId });
        }
        return row as never;
    }

    async getById(id: string) {
        return (this.rows.find((row) => row.id === id) ?? null) as never;
    }

    async findDuplicate({ organizationId, cnpj, completeName, excludeOwnerId }: FindOwnerDuplicateParams) {
        const found = this.rows.find(
            (row) =>
                row.organizationId === organizationId &&
                row.id !== excludeOwnerId &&
                (cnpj !== undefined ? row.personType === "PJ" && row.cnpj === cnpj : row.personType === "PF" && row.completeName === completeName),
        );
        return (found ?? null) as never;
    }

    async delete(id: string) {
        this.writes += 1;
        const row = await this.getById(id);
        this.rows = this.rows.filter((item) => item.id !== id);
        return row;
    }

    async list({ organizationId }: { organizationId: string }) {
        return this.rows.filter((row) => row.organizationId === organizationId) as never;
    }

    async listByVenue({ venueId }: { venueId: string }) {
        const ids = this.links.filter((link) => link.venueId === venueId).map((link) => link.ownerId);
        return this.rows.filter((row) => ids.includes(row.id)) as never;
    }

    venuesOf(ownerId: string) {
        return this.links.filter((link) => link.ownerId === ownerId).map((link) => link.venueId).sort();
    }
}

function setup() {
    const repository = new FakeOwnerRepository();
    const authorizer = new OwnerAuthorizer(
        {
            verifyByUserIdAndOrganizationId: async ({ userId, organizationId }) =>
                (memberships[userId] ?? []).includes(organizationId) ? ({ id: "uo" } as never) : null,
        },
        {
            getById: async ({ venueId }) => (venueOrganization[venueId] ? ({ organizationId: venueOrganization[venueId] } as never) : null),
        },
        repository,
    );
    return {
        repository,
        createOrg: new CreateOrganizationOwnerUseCase(repository, authorizer),
        createVenue: new CreateVenueOwnerUseCase(repository, authorizer),
        update: new UpdateOwnerUseCase(repository, authorizer),
        remove: new DeleteOwnerUseCase(repository, authorizer),
        list: new ListOwnerUseCase(repository, authorizer),
        listByVenue: new ListOwnerByVenueIdUseCase(repository, authorizer),
    };
}

function owner(organizationId: string, extra: Record<string, unknown> = {}) {
    return {
        cep: "01000-000",
        pix: "chave",
        cpf: "000",
        city: "Sao Paulo",
        state: "SP",
        street: "Rua A",
        bankName: "Banco",
        bankAgency: "0001",
        streetNumber: "10",
        completeName: "Fulano",
        neighborhood: "Centro",
        organizationId,
        bankAccountNumber: "123",
        ...extra,
    } as never;
}

const pj = (cnpj: string, extra: Record<string, unknown> = {}) => ({ personType: "PJ", companyName: "Casa Azul", cnpj, ...extra });

async function rejection(promise: Promise<unknown>) {
    try {
        await promise;
    } catch (error) {
        return error as Error;
    }
    throw new Error("esperava erro");
}

describe("isolamento de /owner entre organizacoes", () => {
    it("membro cria, lista, edita e exclui na propria organizacao", async () => {
        const { repository, createOrg, list, update, remove } = setup();

        const created = await createOrg.execute("user-a", owner("org-a", { venueIds: ["venue-a1"] }));
        expect((await list.execute("user-a", { organizationId: "org-a" })).count).toBe(1);

        await update.execute("user-a", { ownerId: created.data.id as string, data: { pix: "nova" } });
        expect(repository.rows[0].pix).toBe("nova");

        await remove.execute("user-a", { ownerId: created.data.id as string });
        expect(repository.rows).toHaveLength(0);
    });

    it("nao membro recebe 403 ao listar ou criar em outra organizacao e nada e gravado", async () => {
        const { repository, createOrg, createVenue, list, listByVenue } = setup();

        for (const promise of [
            list.execute("user-a", { organizationId: "org-b" }),
            listByVenue.execute("user-a", { organizationId: "org-b", venueId: "venue-b1" }),
            createOrg.execute("user-a", owner("org-b")),
            createVenue.execute("user-a", owner("org-b", { venueId: "venue-b1" })),
        ]) {
            const error = await rejection(promise);
            expect(error).toBeInstanceOf(HttpForbiddenError);
            expect(error.message).toBe(OWNER_ORGANIZATION_FORBIDDEN);
        }
        expect(repository.writes).toBe(0);
    });

    it("nao membro recebe 404 ao editar ou excluir proprietario de outra organizacao, sem gravar", async () => {
        const { repository, createOrg, update, remove } = setup();
        const created = await createOrg.execute("user-b", owner("org-b", pj("12ABC34501DE35")));
        const writesBefore = repository.writes;

        const onUpdate = await rejection(update.execute("user-a", { ownerId: created.data.id as string, data: { pix: "x" } }));
        const onDelete = await rejection(remove.execute("user-a", { ownerId: created.data.id as string }));
        const missing = await rejection(update.execute("user-a", { ownerId: "nao-existe", data: {} }));

        for (const error of [onUpdate, onDelete, missing]) {
            expect(error).toBeInstanceOf(HttpResourceNotFoundError);
            expect(error.message).toBe("Proprietario nao encontrado");
        }
        expect(repository.writes).toBe(writesBefore);
        expect(repository.rows).toHaveLength(1);
    });

    it("conflito de CNPJ de outra organizacao nao vaza: o usuario recebe 404 antes da duplicidade", async () => {
        const { createOrg, update } = setup();
        const other = await createOrg.execute("user-b", owner("org-b", pj("12ABC34501DE35")));

        const error = await rejection(update.execute("user-a", { ownerId: other.data.id as string, data: { cnpj: "12ABC34501DE35" } }));
        expect(error).toBeInstanceOf(HttpResourceNotFoundError);
    });

    it("espaco de outra organizacao em venueIds ou venueId responde 403", async () => {
        const { repository, createOrg, createVenue, update, listByVenue } = setup();
        const created = await createOrg.execute("user-a", owner("org-a", { venueIds: ["venue-a1"] }));
        const writesBefore = repository.writes;

        for (const promise of [
            createOrg.execute("user-a", owner("org-a", { completeName: "Outro", venueIds: ["venue-a1", "venue-b1"] })),
            createVenue.execute("user-a", owner("org-a", { completeName: "Outro", venueId: "venue-b1" })),
            update.execute("user-a", { ownerId: created.data.id as string, data: { venueIds: ["venue-b1"] } }),
            listByVenue.execute("user-a", { organizationId: "org-a", venueId: "venue-b1" }),
            createVenue.execute("user-a", owner("org-a", { completeName: "Outro", venueId: "venue-inexistente" })),
        ]) {
            const error = await rejection(promise);
            expect(error).toBeInstanceOf(HttpForbiddenError);
            expect(error.message).toBe(OWNER_VENUE_FORBIDDEN);
        }
        expect(repository.writes).toBe(writesBefore);
        expect(repository.venuesOf(created.data.id as string)).toEqual(["venue-a1"]);
    });

    it("sem usuario no token responde 401", async () => {
        const { createOrg, list, update, remove } = setup();

        for (const promise of [
            list.execute(undefined, { organizationId: "org-a" }),
            createOrg.execute(undefined, owner("org-a")),
            update.execute(undefined, { ownerId: "owner-1", data: {} }),
            remove.execute(undefined, { ownerId: "owner-1" }),
        ]) {
            expect(await rejection(promise)).toBeInstanceOf(HttpTokenError);
        }
    });

    it("organizationId no corpo da edicao e descartado e o proprietario continua na organizacao", async () => {
        const { repository, createOrg, update } = setup();
        const created = await createOrg.execute("user-a", owner("org-a"));

        const body = updateOwnerSchema.parse({ ownerId: created.data.id, data: { pix: "y", organizationId: "org-b" } });
        await update.execute("user-a", body);

        expect(repository.rows[0].organizationId).toBe("org-a");
    });
});

describe("PF/PJ, edicao parcial, vinculos e duplicidade", () => {
    it("cria PJ com CNPJ alfanumerico gravado normalizado", async () => {
        const { repository, createOrg } = setup();

        await createOrg.execute("user-a", owner("org-a", pj("12.abc.345/01de-35", { companySize: "MEI" })));

        expect(repository.rows[0]).toMatchObject({ personType: "PJ", cnpj: "12ABC34501DE35", companySize: "MEI", companyName: "Casa Azul" });
    });

    it("mesmo CNPJ com e sem pontuacao na mesma organizacao responde 409; em outra organizacao cria", async () => {
        const { repository, createOrg } = setup();
        await createOrg.execute("user-a", owner("org-a", pj("12ABC34501DE35")));

        const error = await rejection(createOrg.execute("user-a", owner("org-a", { completeName: "Outro", ...pj("12.ABC.345/01DE-35") })));
        expect(error).toBeInstanceOf(HttpConflictError);
        expect(error.message).toBe("Proprietario com este CNPJ ja registrado.");

        await createOrg.execute("user-b", owner("org-b", pj("12.ABC.345/01DE-35")));
        expect(repository.rows).toHaveLength(2);
    });

    it("PJ nao passa pela checagem de nome", async () => {
        const { repository, createOrg } = setup();
        await createOrg.execute("user-a", owner("org-a"));

        await createOrg.execute("user-a", owner("org-a", pj("12345678000195")));

        expect(repository.rows).toHaveLength(2);
    });

    it("editar PJ para o CNPJ de outro proprietario da organizacao responde 409; manter o proprio passa", async () => {
        const { repository, createOrg, update } = setup();
        await createOrg.execute("user-a", owner("org-a", pj("12ABC34501DE35")));
        const second = await createOrg.execute("user-a", owner("org-a", { completeName: "Outro", ...pj("12345678000195") }));
        const ownerId = second.data.id as string;

        const error = await rejection(update.execute("user-a", { ownerId, data: { cnpj: "12abc34501de35" } }));
        expect(error).toBeInstanceOf(HttpConflictError);
        expect(repository.rows[1].cnpj).toBe("12345678000195");

        await update.execute("user-a", { ownerId, data: { cnpj: "12.345.678/0001-95", pix: "ok" } });
        expect(repository.rows[1]).toMatchObject({ cnpj: "12345678000195", pix: "ok" });
    });

    it("PF com mesmo nome na mesma organizacao responde 409; em outra cria", async () => {
        const { repository, createOrg, createVenue } = setup();
        await createOrg.execute("user-a", owner("org-a"));

        const error = await rejection(createVenue.execute("user-a", owner("org-a", { venueId: "venue-a1" })));
        expect(error).toBeInstanceOf(HttpConflictError);
        expect(error.message).toBe("Proprietario ja registrado.");

        await createOrg.execute("user-b", owner("org-b"));
        expect(repository.rows).toHaveLength(2);
    });

    it("editar so os vinculos de uma PJ (VenueSelectionDialog) preserva tipo, empresa e porte", async () => {
        const { repository, createOrg, update } = setup();
        const created = await createOrg.execute("user-a", owner("org-a", { venueIds: ["venue-a1"], ...pj("12ABC34501DE35", { companySize: "EPP" }) }));
        const ownerId = created.data.id as string;

        await update.execute("user-a", { ownerId, data: { venueIds: ["venue-a1", "venue-a2"] } });

        expect(repository.rows[0]).toMatchObject({ personType: "PJ", companyName: "Casa Azul", cnpj: "12ABC34501DE35", companySize: "EPP" });
        expect(repository.venuesOf(ownerId)).toEqual(["venue-a1", "venue-a2"]);
    });

    it("venueIds omitido preserva os vinculos e [] remove todos", async () => {
        const { repository, createOrg, update } = setup();
        const created = await createOrg.execute("user-a", owner("org-a", { venueIds: ["venue-a1", "venue-a2"] }));
        const ownerId = created.data.id as string;

        await update.execute("user-a", { ownerId, data: { pix: "nova" } });
        expect(repository.venuesOf(ownerId)).toEqual(["venue-a1", "venue-a2"]);

        await update.execute("user-a", { ownerId, data: { venueIds: [] } });
        expect(repository.venuesOf(ownerId)).toEqual([]);
    });

    it("transicoes PF -> PJ -> PF sao persistidas e PF limpa a empresa", async () => {
        const { repository, createOrg, update } = setup();
        const created = await createOrg.execute("user-a", owner("org-a"));
        const ownerId = created.data.id as string;

        await update.execute("user-a", { ownerId, data: pj("12ABC34501DE35", { companySize: "ME" }) as never });
        expect(repository.rows[0]).toMatchObject({ personType: "PJ", cnpj: "12ABC34501DE35", companySize: "ME" });

        await update.execute("user-a", { ownerId, data: { companySize: null } });
        expect(repository.rows[0]).toMatchObject({ personType: "PJ", companySize: null });

        await update.execute("user-a", { ownerId, data: { personType: "PF" } });
        expect(repository.rows[0]).toMatchObject({ personType: "PF", companyName: null, cnpj: null, companySize: null });
    });

    it("PF -> PJ sem CNPJ responde 400 e nada muda", async () => {
        const { repository, createOrg, update } = setup();
        const created = await createOrg.execute("user-a", owner("org-a"));

        const error = await rejection(update.execute("user-a", { ownerId: created.data.id as string, data: { personType: "PJ", companyName: "X" } }));
        expect((error as Error & { statusCode: number }).statusCode).toBe(400);
        expect(repository.rows[0].personType).toBe("PF");
    });
});

describe("repositorio Prisma de proprietario", () => {
    it("update sem venueIds nao manda ownerVenue ao Prisma", async () => {
        const calls: Array<{ data: Record<string, unknown> }> = [];
        const prisma = {
            ownerVenue: { findMany: async () => { throw new Error("nao deveria ler vinculos"); } },
            owner: {
                update: async (args: { data: Record<string, unknown> }) => {
                    calls.push(args);
                    return { id: "owner-1", ...args.data };
                },
            },
        };
        const repository = new PrismaOwnerRepository(prisma as never);

        const result = await repository.update({
            ownerId: "owner-1",
            data: { pix: "x", personType: "PJ", companyName: "Casa Azul", cnpj: "12ABC34501DE35", companySize: null },
        });

        expect(calls[0].data).not.toHaveProperty("ownerVenue");
        expect(calls[0].data).toMatchObject({ pix: "x", personType: "PJ", cnpj: "12ABC34501DE35", companySize: null });
        expect(result).toMatchObject({ personType: "PJ", cnpj: "12ABC34501DE35" });
    });

    it("update com venueIds sincroniza os vinculos", async () => {
        const calls: Array<{ data: { ownerVenue: { create: unknown[]; deleteMany: unknown[] } } }> = [];
        const prisma = {
            ownerVenue: { findMany: async () => [{ venueId: "venue-a1" }, { venueId: "venue-a2" }] },
            owner: {
                update: async (args: never) => {
                    calls.push(args);
                    return { id: "owner-1" };
                },
            },
        };
        const repository = new PrismaOwnerRepository(prisma as never);

        await repository.update({ ownerId: "owner-1", data: { venueIds: ["venue-a2", "venue-a3"] } });

        expect(calls[0].data.ownerVenue.create).toEqual([{ venue: { connect: { id: "venue-a3" } } }]);
        expect(calls[0].data.ownerVenue.deleteMany).toEqual([{ ownerId: "owner-1", venueId: "venue-a1" }]);
    });

    it("findDuplicate busca dentro da organizacao, por CNPJ em PJ e por nome em PF", async () => {
        const wheres: Record<string, unknown>[] = [];
        const prisma = {
            owner: {
                findFirst: async (args: { where: Record<string, unknown> }) => {
                    wheres.push(args.where);
                    return null;
                },
            },
        };
        const repository = new PrismaOwnerRepository(prisma as never);

        await repository.findDuplicate({ organizationId: "org-a", cnpj: "12ABC34501DE35", excludeOwnerId: "owner-1" });
        await repository.findDuplicate({ organizationId: "org-a", completeName: "Fulano" });

        expect(wheres[0]).toEqual({ organizationId: "org-a", personType: "PJ", cnpj: "12ABC34501DE35", id: { not: "owner-1" } });
        expect(wheres[1]).toEqual({ organizationId: "org-a", personType: "PF", completeName: "Fulano" });
    });
});

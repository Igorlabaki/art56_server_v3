import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { HttpConflictError } from "../../errors/errors-type/htttp-conflict-error";
import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import { assertServiceImageFile, SERVICE_IMAGE_MAX_BYTES } from "../../functions/service-image";
import { ServiceRepositoryInterface } from "../../repositories/interface/service-repository-interface";
import { createServiceSchema } from "../../zod/services/create-service-params-schema";
import { updateServiceSchema } from "../../zod/services/update-service-params-schema";
import { CreateServiceUseCase } from "./create-service/use-case-create-service";
import { DeleteServiceUseCase } from "./delete-service/use-case-delete-service";
import { ServiceAuthorizer } from "./service-authorizer";
import { UpdateServiceUseCase } from "./update-service/use-case-update-service";

function authorizerFor(permissionsByVenue: Record<string, string>) {
    return new ServiceAuthorizer(
        {
            getById: async ({ venueId }) => {
                if (venueId !== "venue-a" && venueId !== "venue-b") return null;
                return { organizationId: "org-1" } as never;
            },
        },
        {
            getUserVenuePermission: async ({ venueId }) => {
                const permissions = permissionsByVenue[venueId ?? ""];
                if (!permissions) return null;
                return { permissions } as never;
            },
        },
    );
}

class FakeServiceRepository implements ServiceRepositoryInterface {
    rows: Array<Record<string, unknown> & { id: string; name: string; venueId: string; imageUrl?: string | null }> = [];
    created = 0;
    updated: unknown[] = [];
    deleted = 0;

    async create(params: { name: string; venueId: string; imageUrl?: string | null }) {
        this.created += 1;
        const row = { id: `svc-${this.rows.length + 1}`, imageUrl: null, ...params };
        this.rows.push(row);
        return row as never;
    }

    async getByName({ name, venueId }: { name: string; venueId: string }) {
        return (this.rows.find((row) => row.name === name && row.venueId === venueId) ?? null) as never;
    }

    async getById(id: string) {
        return (this.rows.find((row) => row.id === id) ?? null) as never;
    }

    async update(param: { serviceId: string; data: Record<string, unknown> }) {
        this.updated.push(param.data);
        const row = this.rows.find((item) => item.id === param.serviceId);
        if (!row) return null;
        Object.assign(row, param.data);
        return row as never;
    }

    async delete(id: string) {
        this.deleted += 1;
        const row = await this.getById(id);
        this.rows = this.rows.filter((item) => item.id !== id);
        return row;
    }

    async getByVenueId() { return []; }
    async list() { return []; }
    async listForQuote() { return []; }
}

const editor = authorizerFor({ "venue-a": "VIEW_VENUE_SERVICES,EDIT_VENUE_SERVICES" });
const viewer = authorizerFor({ "venue-a": "VIEW_VENUE_SERVICES" });
const otherVenue = authorizerFor({ "venue-b": "EDIT_VENUE_SERVICES" });

describe("servico do espaco", () => {
    it("recusa criar, atualizar e apagar sem permissao de edicao e nao grava", async () => {
        const repository = new FakeServiceRepository();
        await repository.create({ name: "Limpeza", venueId: "venue-a", price: 10 } as never);
        const create = new CreateServiceUseCase(repository, viewer);
        const update = new UpdateServiceUseCase(repository, viewer);
        const remove = new DeleteServiceUseCase(repository, viewer);

        await expect(create.execute("user-1", createServiceSchema.parse({
            name: "Outro",
            price: 20,
            venueId: "venue-a",
        }))).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(update.execute("user-1", updateServiceSchema.parse({
            serviceId: "svc-1",
            data: { name: "Novo" },
        }))).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(remove.execute("user-1", { serviceId: "svc-1" })).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(repository.created).toBe(1);
        expect(repository.updated).toEqual([]);
        expect(repository.deleted).toBe(0);
    });

    it("permissao em outro espaco nao grava neste", async () => {
        const repository = new FakeServiceRepository();
        const create = new CreateServiceUseCase(repository, otherVenue);
        await expect(create.execute("user-1", createServiceSchema.parse({
            name: "Bar",
            price: 10,
            venueId: "venue-a",
        }))).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(repository.created).toBe(0);
    });

    it("descricao longa e preco negativo respondem 400", () => {
        expect(() => createServiceSchema.parse({
            name: "Bar",
            price: -1,
            venueId: "venue-a",
        })).toThrow(ZodError);
        expect(() => createServiceSchema.parse({
            name: "Bar",
            price: 10,
            venueId: "venue-a",
            description: "a".repeat(501),
        })).toThrow(ZodError);
    });

    it("arquivo que nao e imagem ou passa de 5 MB nao gera url", () => {
        expect(() => assertServiceImageFile({ size: 100, mimetype: "application/pdf" })).toThrow();
        expect(() => assertServiceImageFile({
            size: SERVICE_IMAGE_MAX_BYTES + 1,
            mimetype: "image/png",
        })).toThrow();
    });

    it("atualizar sem arquivo mantem a foto e a remocao explicita zera", async () => {
        const repository = new FakeServiceRepository();
        repository.rows.push({ id: "svc-1", name: "Bar", venueId: "venue-a", imageUrl: "https://foto" });
        const update = new UpdateServiceUseCase(repository, editor);
        await update.execute("user-1", updateServiceSchema.parse({
            serviceId: "svc-1",
            data: { name: "Bar novo" },
        }));
        expect(repository.rows[0].imageUrl).toBe("https://foto");

        await update.execute("user-1", updateServiceSchema.parse({
            serviceId: "svc-1",
            data: { removeImage: true },
        }));
        expect(repository.rows[0].imageUrl).toBeNull();
    });

    it("a foto fica no servico e nao cria registro de galeria", async () => {
        const repository = new FakeServiceRepository();
        const create = new CreateServiceUseCase(repository, editor);
        const response = await create.execute("user-1", createServiceSchema.parse({
            name: "DJ",
            price: 200,
            pricingType: "PER_HOUR",
            venueId: "venue-a",
            imageUrl: "https://bucket.s3.region.amazonaws.com/dj.webp",
        }));
        expect(response.data.imageUrl).toContain("dj.webp");
        expect(repository.created).toBe(1);
        expect(repository.rows[0]).not.toHaveProperty("group");
    });

    it("nome repetido no espaco continua conflito", async () => {
        const repository = new FakeServiceRepository();
        const create = new CreateServiceUseCase(repository, editor);
        const params = createServiceSchema.parse({ name: "Bar", price: 0, venueId: "venue-a" });
        await create.execute("user-1", params);
        await expect(create.execute("user-1", params)).rejects.toBeInstanceOf(HttpConflictError);
    });
});

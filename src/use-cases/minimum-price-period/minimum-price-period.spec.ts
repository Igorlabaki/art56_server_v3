import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { MinimumPricePeriod } from "@prisma/client";
import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../errors/errors-type/http-token-error";
import { MinimumPricePeriodRepositoryInterface } from "../../repositories/interface/minimum-price-period-repository-interface";
import { createMinimumPricePeriodSchema } from "../../zod/minimumPricePeriod/create-minimum-price-period-params-schema";
import { CreateMinimumPricePeriodUseCase } from "./create-minimum-price-period/use-case-create-minimum-price-period";
import { DeleteMinimumPricePeriodUseCase } from "./delete-minimum-price-period/use-case-delete-minimum-price-period";
import { ListMinimumPricePeriodUseCase } from "./list-minimum-price-period/use-case-list-minimum-price-period";
import { UpdateMinimumPricePeriodUseCase } from "./update-minimum-price-period/use-case-update-minimum-price-period";
import { VenuePriceAuthorizer } from "./venue-price-authorizer";

const periodInput = {
    venueId: "venue-a",
    title: "Dezembro",
    startDay: "01/12",
    endDay: "31/12",
    price: 15000,
};

function authorizerFor(permissionsByVenue: Record<string, string>) {
    return new VenuePriceAuthorizer(
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

class FakePeriodRepository implements MinimumPricePeriodRepositoryInterface {
    items: MinimumPricePeriod[] = [];
    updates = 0;
    deletes = 0;

    async create(params: typeof periodInput): Promise<MinimumPricePeriod> {
        const row = {
            ...params,
            id: "period-1",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.items.push(row);
        return row;
    }

    async list(venueId: string) {
        return this.items.filter((item) => item.venueId === venueId);
    }

    async getById(id: string) {
        return this.items.find((item) => item.id === id) ?? null;
    }

    async update(params: { id: string; title: string; startDay: string; endDay: string; price: number }) {
        this.updates += 1;
        const current = await this.getById(params.id);
        if (!current) throw new Error("missing");
        Object.assign(current, params);
        return current;
    }

    async delete(id: string) {
        this.deletes += 1;
        const current = await this.getById(id);
        if (!current) throw new Error("missing");
        this.items = this.items.filter((item) => item.id !== id);
        return current;
    }
}

describe("minimum price period", () => {
    it("cria e lista a faixa no venue autorizado", async () => {
        const repository = new FakePeriodRepository();
        const authorizer = authorizerFor({ "venue-a": "VIEW_VENUE_PRICES,EDIT_VENUE_PRICES" });
        const create = new CreateMinimumPricePeriodUseCase(repository, authorizer);
        const list = new ListMinimumPricePeriodUseCase(repository, authorizer);

        const created = await create.execute("user-1", periodInput);
        const listed = await list.execute("user-1", "venue-a");

        expect(created.data.venueId).toBe("venue-a");
        expect(listed.data.minimumPricePeriodList).toHaveLength(1);
    });

    it("recusa criar sem permissao de edicao naquele venue", async () => {
        const repository = new FakePeriodRepository();
        const create = new CreateMinimumPricePeriodUseCase(
            repository,
            authorizerFor({ "venue-b": "EDIT_VENUE_PRICES" }),
        );

        await expect(create.execute("user-1", periodInput)).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(repository.items).toHaveLength(0);
    });

    it("recusa listar sem permissao de ver naquele venue", async () => {
        const repository = new FakePeriodRepository();
        const list = new ListMinimumPricePeriodUseCase(
            repository,
            authorizerFor({ "venue-a": "EDIT_VENUE_PRICES" }),
        );

        await expect(list.execute("user-1", "venue-a")).rejects.toBeInstanceOf(HttpForbiddenError);
    });

    it("recusa gravar sem usuario", async () => {
        const repository = new FakePeriodRepository();
        const create = new CreateMinimumPricePeriodUseCase(
            repository,
            authorizerFor({ "venue-a": "EDIT_VENUE_PRICES" }),
        );

        await expect(create.execute(undefined, periodInput)).rejects.toBeInstanceOf(HttpTokenError);
        expect(repository.items).toHaveLength(0);
    });

    it("rejeita preco zero e data invalida", () => {
        expect(() => createMinimumPricePeriodSchema.parse({ ...periodInput, price: 0 })).toThrow(ZodError);
        expect(() => createMinimumPricePeriodSchema.parse({ ...periodInput, startDay: "32/01" })).toThrow(ZodError);
    });

    it("nao altera faixa de outro venue", async () => {
        const repository = new FakePeriodRepository();
        await repository.create(periodInput);
        const update = new UpdateMinimumPricePeriodUseCase(
            repository,
            authorizerFor({ "venue-b": "EDIT_VENUE_PRICES" }),
        );
        const remove = new DeleteMinimumPricePeriodUseCase(
            repository,
            authorizerFor({ "venue-b": "EDIT_VENUE_PRICES" }),
        );

        await expect(update.execute("user-1", { ...periodInput, id: "period-1", price: 1 })).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(remove.execute("user-1", "period-1")).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(repository.updates).toBe(0);
        expect(repository.deletes).toBe(0);
        expect(repository.items).toHaveLength(1);
    });

    it("responde 404 quando a faixa nao existe", async () => {
        const update = new UpdateMinimumPricePeriodUseCase(
            new FakePeriodRepository(),
            authorizerFor({ "venue-a": "EDIT_VENUE_PRICES" }),
        );

        await expect(update.execute("user-1", { ...periodInput, id: "missing" })).rejects.toBeInstanceOf(HttpResourceNotFoundError);
    });
});

import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { VenueAmenity } from "@prisma/client";
import { HttpConflictError } from "../../errors/errors-type/htttp-conflict-error";
import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../errors/errors-type/http-token-error";
import { VenueAmenityRepositoryInterface } from "../../repositories/interface/venue-amenity-repository-interface";
import { createVenueAmenitySchema } from "../../zod/venue-amenity/create-venue-amenity-schema";
import { updateVenueAmenitySchema } from "../../zod/venue-amenity/update-venue-amenity-schema";
import { CreateVenueAmenityUseCase } from "./create-venue-amenity/use-case-create-venue-amenity";
import { DeleteVenueAmenityUseCase } from "./delete-venue-amenity/use-case-delete-venue-amenity";
import { ListVenueAmenityUseCase } from "./list-venue-amenity/use-case-list-venue-amenity";
import { UpdateVenueAmenityUseCase } from "./update-venue-amenity/use-case-update-venue-amenity";
import { VenueAmenityAuthorizer } from "./venue-amenity-authorizer";

function authorizerFor(permissionsByVenue: Record<string, string>) {
    return new VenueAmenityAuthorizer(
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

class FakeVenueAmenityRepository implements VenueAmenityRepositoryInterface {
    items: VenueAmenity[] = [];
    updates = 0;
    deletes = 0;

    async create(params: { venueId: string; name: string; position: number }): Promise<VenueAmenity> {
        const row: VenueAmenity = {
            id: `amenity-${this.items.length + 1}`,
            name: params.name,
            position: params.position,
            venueId: params.venueId,
            createdAt: new Date(2026, 0, this.items.length + 1),
            updatedAt: new Date(),
        };
        this.items.push(row);
        return row;
    }

    async listByVenue(venueId: string) {
        return this.items
            .filter((item) => item.venueId === venueId)
            .sort((a, b) => a.position - b.position || a.createdAt.getTime() - b.createdAt.getTime());
    }

    async getById(id: string) {
        return this.items.find((item) => item.id === id) ?? null;
    }

    async findByName(venueId: string, name: string) {
        const normalized = name.trim().toLowerCase();
        return this.items.find((item) => item.venueId === venueId && item.name.trim().toLowerCase() === normalized) ?? null;
    }

    async nextPosition(venueId: string) {
        const positions = this.items.filter((item) => item.venueId === venueId).map((item) => item.position);
        if (positions.length === 0) return 0;
        return Math.max(...positions) + 1;
    }

    async update(params: { amenityId: string; name: string; position: number }) {
        this.updates += 1;
        const current = await this.getById(params.amenityId);
        if (!current) throw new Error("missing");
        current.name = params.name;
        current.position = params.position;
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

const editor = authorizerFor({ "venue-a": "VIEW_VENUE_AMENITIES,EDIT_VENUE_AMENITIES" });
const viewer = authorizerFor({ "venue-a": "VIEW_VENUE_AMENITIES" });
const otherVenue = authorizerFor({ "venue-b": "VIEW_VENUE_AMENITIES,EDIT_VENUE_AMENITIES" });

describe("venue amenity", () => {
    it("cria no fim da lista e lista ordenada, inclusive vazia", async () => {
        const repository = new FakeVenueAmenityRepository();
        const create = new CreateVenueAmenityUseCase(repository, editor);
        const list = new ListVenueAmenityUseCase(repository, editor);

        const empty = await list.execute("user-1", "venue-a");
        expect(empty.data).toEqual([]);

        await create.execute("user-1", { venueId: "venue-a", name: "Piscina aquecida" });
        await create.execute("user-1", { venueId: "venue-a", name: "Telao" });

        const listed = await list.execute("user-1", "venue-a");
        expect(listed.data.map((item) => item.position)).toEqual([0, 1]);
        expect(listed.data[1].name).toBe("Telao");
    });

    it("recusa nome vazio, nome longo, posicao negativa e usuario sem token", async () => {
        expect(() => createVenueAmenitySchema.parse({ venueId: "venue-a", name: "   " })).toThrow(ZodError);
        expect(() => createVenueAmenitySchema.parse({ venueId: "venue-a", name: "a".repeat(121) })).toThrow(ZodError);
        expect(() => updateVenueAmenitySchema.parse({ amenityId: "amenity-1", name: "Salao", position: -1 })).toThrow(ZodError);

        const repository = new FakeVenueAmenityRepository();
        const create = new CreateVenueAmenityUseCase(repository, editor);
        await expect(create.execute(undefined, { venueId: "venue-a", name: "Piscina" })).rejects.toBeInstanceOf(HttpTokenError);
    });

    it("recusa nome duplicado no mesmo venue", async () => {
        const repository = new FakeVenueAmenityRepository();
        const create = new CreateVenueAmenityUseCase(repository, editor);
        await create.execute("user-1", { venueId: "venue-a", name: "Piscina aquecida" });
        await expect(create.execute("user-1", { venueId: "venue-a", name: "piscina aquecida" })).rejects.toBeInstanceOf(HttpConflictError);
        expect(repository.items).toHaveLength(1);
    });

    it("recusa listar e gravar sem a permissao daquele venue", async () => {
        const repository = new FakeVenueAmenityRepository();
        repository.items.push({
            id: "amenity-1",
            name: "Salao interno",
            position: 0,
            venueId: "venue-a",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const list = new ListVenueAmenityUseCase(repository, otherVenue);
        const update = new UpdateVenueAmenityUseCase(repository, viewer);
        const remove = new DeleteVenueAmenityUseCase(repository, otherVenue);

        await expect(list.execute("user-1", "venue-a")).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(update.execute("user-1", {
            amenityId: "amenity-1",
            name: "Nome novo",
            position: 0,
        })).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(remove.execute("user-1", "amenity-1")).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(repository.updates).toBe(0);
        expect(repository.deletes).toBe(0);
        expect(repository.items[0].name).toBe("Salao interno");
    });

    it("nao altera caracteristica de outro venue e responde 404 quando nao existe", async () => {
        const repository = new FakeVenueAmenityRepository();
        repository.items.push({
            id: "amenity-1",
            name: "Telao",
            position: 3,
            venueId: "venue-a",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const update = new UpdateVenueAmenityUseCase(repository, otherVenue);
        await expect(update.execute("user-1", {
            amenityId: "amenity-1",
            name: "Invadida",
        })).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(repository.items[0].name).toBe("Telao");

        const missing = new UpdateVenueAmenityUseCase(repository, editor);
        await expect(missing.execute("user-1", {
            amenityId: "nao-existe",
            name: "Salao",
        })).rejects.toBeInstanceOf(HttpResourceNotFoundError);
    });
});

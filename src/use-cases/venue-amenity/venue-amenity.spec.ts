import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { VenueAmenity } from "@prisma/client";
import { HttpConflictError } from "../../errors/errors-type/htttp-conflict-error";
import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../errors/errors-type/http-token-error";
import { HttpBadRequestError } from "../../errors/errors-type/htttp-bad-request-error";
import { AmenityImageFile, AmenityImageStorage } from "../../functions/venue-amenity-image";
import {
    CreateVenueAmenityData,
    UpdateVenueAmenityData,
    VenueAmenityRepositoryInterface,
} from "../../repositories/interface/venue-amenity-repository-interface";
import { createVenueAmenitySchema } from "../../zod/venue-amenity/create-venue-amenity-schema";
import { updateVenueAmenitySchema } from "../../zod/venue-amenity/update-venue-amenity-schema";
import { isTourVideoUrl, isYoutubeUrl } from "../../zod/venue/tour-video-url-schema";
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

    async create(params: CreateVenueAmenityData): Promise<VenueAmenity> {
        const row: VenueAmenity = {
            id: `amenity-${this.items.length + 1}`,
            name: params.name,
            position: params.position,
            description: params.description,
            imageUrl: params.imageUrl,
            videoUrl: params.videoUrl,
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

    async update(params: UpdateVenueAmenityData) {
        this.updates += 1;
        const current = await this.getById(params.amenityId);
        if (!current) throw new Error("missing");
        current.name = params.name;
        current.position = params.position;
        current.description = params.description;
        current.imageUrl = params.imageUrl;
        current.videoUrl = params.videoUrl;
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

class FakeImageStorage implements AmenityImageStorage {
    uploaded: string[] = [];
    removed: string[] = [];

    upload = async (file: AmenityImageFile) => {
        const url = `https://bucket.s3.region.amazonaws.com/${file.buffer.toString()}.webp`;
        this.uploaded.push(url);
        return url;
    };

    remove = async (imageUrl: string) => {
        this.removed.push(imageUrl);
    };
}

function photo(name: string, overrides: Partial<AmenityImageFile> = {}): AmenityImageFile {
    return { buffer: Buffer.from(name), size: 1000, mimetype: "image/png", ...overrides };
}

function row(overrides: Partial<VenueAmenity> = {}): VenueAmenity {
    return {
        id: "amenity-1",
        name: "Piscina",
        position: 0,
        description: null,
        imageUrl: null,
        videoUrl: null,
        venueId: "venue-a",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

const YOUTUBE = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const OLD_PHOTO = "https://bucket.s3.region.amazonaws.com/antiga.webp";

const editor = authorizerFor({ "venue-a": "VIEW_VENUE_AMENITIES,EDIT_VENUE_AMENITIES" });
const viewer = authorizerFor({ "venue-a": "VIEW_VENUE_AMENITIES" });
const otherVenue = authorizerFor({ "venue-b": "VIEW_VENUE_AMENITIES,EDIT_VENUE_AMENITIES" });

function createParams(input: Record<string, unknown>) {
    return createVenueAmenitySchema.parse({ venueId: "venue-a", ...input });
}

function updateParams(input: Record<string, unknown>) {
    return updateVenueAmenitySchema.parse({ amenityId: "amenity-1", name: "Piscina", ...input });
}

describe("venue amenity", () => {
    it("cria no fim da lista e lista ordenada, inclusive vazia", async () => {
        const repository = new FakeVenueAmenityRepository();
        const create = new CreateVenueAmenityUseCase(repository, editor, new FakeImageStorage());
        const list = new ListVenueAmenityUseCase(repository, editor);

        const empty = await list.execute("user-1", "venue-a");
        expect(empty.data).toEqual([]);

        await create.execute("user-1", createParams({ name: "Piscina aquecida" }));
        await create.execute("user-1", createParams({ name: "Telao" }));

        const listed = await list.execute("user-1", "venue-a");
        expect(listed.data.map((item) => item.position)).toEqual([0, 1]);
        expect(listed.data[1].name).toBe("Telao");
        expect(listed.data[1]).toMatchObject({ description: null, imageUrl: null, videoUrl: null });
    });

    it("recusa nome vazio, nome longo, posicao negativa e usuario sem token", async () => {
        expect(() => createParams({ name: "   " })).toThrow(ZodError);
        expect(() => createParams({ name: "a".repeat(121) })).toThrow(ZodError);
        expect(() => updateParams({ position: -1 })).toThrow(ZodError);

        const repository = new FakeVenueAmenityRepository();
        const create = new CreateVenueAmenityUseCase(repository, editor, new FakeImageStorage());
        await expect(create.execute(undefined, createParams({ name: "Piscina" }))).rejects.toBeInstanceOf(HttpTokenError);
    });

    it("recusa nome duplicado no mesmo venue", async () => {
        const repository = new FakeVenueAmenityRepository();
        const create = new CreateVenueAmenityUseCase(repository, editor, new FakeImageStorage());
        await create.execute("user-1", createParams({ name: "Piscina aquecida" }));
        await expect(create.execute("user-1", createParams({ name: "piscina aquecida" }))).rejects.toBeInstanceOf(HttpConflictError);
        expect(repository.items).toHaveLength(1);
    });

    it("recusa listar e gravar sem a permissao daquele venue, sem subir foto", async () => {
        const repository = new FakeVenueAmenityRepository();
        repository.items.push(row({ name: "Salao interno", imageUrl: OLD_PHOTO }));
        const storage = new FakeImageStorage();

        const list = new ListVenueAmenityUseCase(repository, otherVenue);
        const create = new CreateVenueAmenityUseCase(repository, viewer, storage);
        const update = new UpdateVenueAmenityUseCase(repository, viewer, storage);
        const remove = new DeleteVenueAmenityUseCase(repository, otherVenue, storage);

        await expect(list.execute("user-1", "venue-a")).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(create.execute("user-1", createParams({ name: "Telao" }), photo("nova")))
            .rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(update.execute("user-1", updateParams({ name: "Nome novo", position: 0 }), photo("nova")))
            .rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(remove.execute("user-1", "amenity-1")).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(repository.updates).toBe(0);
        expect(repository.deletes).toBe(0);
        expect(repository.items).toHaveLength(1);
        expect(repository.items[0]).toMatchObject({ name: "Salao interno", imageUrl: OLD_PHOTO });
        expect(storage.uploaded).toEqual([]);
        expect(storage.removed).toEqual([]);
    });

    it("nao altera caracteristica de outro venue e responde 404 quando nao existe", async () => {
        const repository = new FakeVenueAmenityRepository();
        repository.items.push(row({ name: "Telao", position: 3 }));

        const update = new UpdateVenueAmenityUseCase(repository, otherVenue, new FakeImageStorage());
        await expect(update.execute("user-1", updateParams({ name: "Invadida" }))).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(repository.items[0].name).toBe("Telao");

        const missing = new UpdateVenueAmenityUseCase(repository, editor, new FakeImageStorage());
        await expect(missing.execute("user-1", updateParams({ amenityId: "nao-existe", name: "Salao" })))
            .rejects.toBeInstanceOf(HttpResourceNotFoundError);
    });

    it("grava descricao sem espacos nas pontas, vazia como nulo e recusa acima de 500", async () => {
        expect(createParams({ name: "Piscina", description: "  Aquecida  " }).description).toBe("Aquecida");
        expect(createParams({ name: "Piscina", description: "   " }).description).toBeNull();
        expect(createParams({ name: "Piscina" }).description).toBeUndefined();
        expect(() => createParams({ name: "Piscina", description: "a".repeat(501) })).toThrow(ZodError);

        const repository = new FakeVenueAmenityRepository();
        const create = new CreateVenueAmenityUseCase(repository, editor, new FakeImageStorage());
        await create.execute("user-1", createParams({ name: "Piscina" }));
        expect(repository.items[0].description).toBeNull();
    });

    it("aceita so link https do YouTube como video", () => {
        for (const url of [
            YOUTUBE,
            "https://youtu.be/dQw4w9WgXcQ",
            "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
        ]) {
            expect(isYoutubeUrl(url)).toBe(true);
            expect(createParams({ name: "Piscina", videoUrl: url }).videoUrl).toBe(url);
        }

        for (const url of [
            "https://cdn.example.com/tour.mp4",
            "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://vimeo.com/123456",
            "https://user:pass@www.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://www.youtube.com/watch?v=curto",
        ]) {
            expect(isYoutubeUrl(url)).toBe(false);
            expect(() => createParams({ name: "Piscina", videoUrl: url })).toThrow(ZodError);
        }

        expect(isTourVideoUrl("https://cdn.example.com/tour.mp4")).toBe(true);
        expect(createParams({ name: "Piscina", videoUrl: "" }).videoUrl).toBeNull();
        expect(updateParams({ videoUrl: "  " }).videoUrl).toBeNull();
        expect(updateParams({}).videoUrl).toBeUndefined();
    });

    it("cria com foto, video e descricao no mesmo envio e ignora imageUrl do cliente", async () => {
        const repository = new FakeVenueAmenityRepository();
        const storage = new FakeImageStorage();
        const create = new CreateVenueAmenityUseCase(repository, editor, storage);

        const params = createParams({
            name: "Piscina",
            description: "Aquecida",
            videoUrl: YOUTUBE,
            imageUrl: "https://atacante.com/x.png",
        });
        await create.execute("user-1", params, photo("piscina"));

        expect(repository.items[0]).toMatchObject({
            description: "Aquecida",
            imageUrl: "https://bucket.s3.region.amazonaws.com/piscina.webp",
            videoUrl: YOUTUBE,
        });
        expect(storage.uploaded).toHaveLength(1);
    });

    it("recusa arquivo que nao e imagem ou passa de 5 MB sem subir nem gravar", async () => {
        const repository = new FakeVenueAmenityRepository();
        repository.items.push(row({ imageUrl: OLD_PHOTO }));
        const storage = new FakeImageStorage();
        const create = new CreateVenueAmenityUseCase(repository, editor, storage);
        const update = new UpdateVenueAmenityUseCase(repository, editor, storage);

        await expect(create.execute("user-1", createParams({ name: "Telao" }), photo("doc", { mimetype: "application/pdf" })))
            .rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(update.execute("user-1", updateParams({}), photo("grande", { size: 5 * 1024 * 1024 + 1 })))
            .rejects.toBeInstanceOf(HttpBadRequestError);

        expect(repository.items).toHaveLength(1);
        expect(repository.items[0].imageUrl).toBe(OLD_PHOTO);
        expect(repository.updates).toBe(0);
        expect(storage.uploaded).toEqual([]);
        expect(storage.removed).toEqual([]);
    });

    it("informar video num item com foto mantem a foto", async () => {
        const repository = new FakeVenueAmenityRepository();
        repository.items.push(row({ imageUrl: OLD_PHOTO }));
        const storage = new FakeImageStorage();
        const update = new UpdateVenueAmenityUseCase(repository, editor, storage);

        await update.execute("user-1", updateParams({ videoUrl: YOUTUBE }));

        expect(repository.items[0]).toMatchObject({ imageUrl: OLD_PHOTO, videoUrl: YOUTUBE });
        expect(storage.removed).toEqual([]);
    });

    it("apagar a foto mantem o video e remove o objeto", async () => {
        const repository = new FakeVenueAmenityRepository();
        repository.items.push(row({ imageUrl: OLD_PHOTO, videoUrl: YOUTUBE }));
        const storage = new FakeImageStorage();
        const update = new UpdateVenueAmenityUseCase(repository, editor, storage);

        await update.execute("user-1", updateParams({ removeImage: "true" }));

        expect(repository.items[0]).toMatchObject({ imageUrl: null, videoUrl: YOUTUBE });
        expect(storage.removed).toEqual([OLD_PHOTO]);
    });

    it("trocar a foto remove o objeto anterior e mantem o video", async () => {
        const repository = new FakeVenueAmenityRepository();
        repository.items.push(row({ imageUrl: OLD_PHOTO, videoUrl: YOUTUBE }));
        const storage = new FakeImageStorage();
        const update = new UpdateVenueAmenityUseCase(repository, editor, storage);

        await update.execute("user-1", updateParams({ removeImage: true }), photo("nova"));

        expect(repository.items[0]).toMatchObject({
            imageUrl: "https://bucket.s3.region.amazonaws.com/nova.webp",
            videoUrl: YOUTUBE,
        });
        expect(storage.removed).toEqual([OLD_PHOTO]);
    });

    it("video vazio zera so o video e video ausente mantem o atual", async () => {
        const repository = new FakeVenueAmenityRepository();
        repository.items.push(row({ imageUrl: OLD_PHOTO, videoUrl: YOUTUBE, description: "Aquecida" }));
        const storage = new FakeImageStorage();
        const update = new UpdateVenueAmenityUseCase(repository, editor, storage);

        await update.execute("user-1", updateParams({ name: "Piscina coberta" }));
        expect(repository.items[0]).toMatchObject({ imageUrl: OLD_PHOTO, videoUrl: YOUTUBE, description: "Aquecida" });

        await update.execute("user-1", updateParams({ videoUrl: "" }));
        expect(repository.items[0]).toMatchObject({ imageUrl: OLD_PHOTO, videoUrl: null });
        expect(storage.removed).toEqual([]);
    });

    it("excluir item com foto remove a linha e o objeto", async () => {
        const repository = new FakeVenueAmenityRepository();
        repository.items.push(row({ imageUrl: OLD_PHOTO, videoUrl: YOUTUBE }));
        const storage = new FakeImageStorage();
        const remove = new DeleteVenueAmenityUseCase(repository, editor, storage);

        await remove.execute("user-1", "amenity-1");

        expect(repository.items).toEqual([]);
        expect(storage.removed).toEqual([OLD_PHOTO]);
    });

    it("caracteristica antiga so com nome continua editavel e excluivel sem tocar no storage", async () => {
        const repository = new FakeVenueAmenityRepository();
        repository.items.push(row());
        const storage = new FakeImageStorage();
        const update = new UpdateVenueAmenityUseCase(repository, editor, storage);
        const remove = new DeleteVenueAmenityUseCase(repository, editor, storage);

        await update.execute("user-1", updateParams({ name: "Piscina coberta" }));
        expect(repository.items[0]).toMatchObject({
            name: "Piscina coberta",
            description: null,
            imageUrl: null,
            videoUrl: null,
        });

        await remove.execute("user-1", "amenity-1");
        expect(storage.uploaded).toEqual([]);
        expect(storage.removed).toEqual([]);
    });
});


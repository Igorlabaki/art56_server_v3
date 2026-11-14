import { describe, expect, it } from "vitest";
import multer from "multer";
import { ZodError } from "zod";
import { VenueAmenity, VenueAmenityImage } from "@prisma/client";
import { HttpConflictError } from "../../errors/errors-type/htttp-conflict-error";
import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../errors/errors-type/http-resource-not-found-error";
import { HttpTokenError } from "../../errors/errors-type/http-token-error";
import { HttpBadRequestError } from "../../errors/errors-type/htttp-bad-request-error";
import {
    AMENITY_IMAGE_INVALID_MESSAGE,
    AMENITY_IMAGE_LIMIT_MESSAGE,
    AMENITY_IMAGE_SIZE_MESSAGE,
    AmenityImageFile,
    AmenityImageStorage,
} from "../../functions/venue-amenity-image";
import { amenityUploadError } from "../../functions/venue-amenity-upload";
import {
    CreateVenueAmenityData,
    UpdateVenueAmenityData,
    VenueAmenityImageInput,
    VenueAmenityRepositoryInterface,
    VenueAmenityWithImages,
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
    items: VenueAmenityWithImages[] = [];
    updates = 0;
    deletes = 0;
    failUpdate = false;
    private imageSeq = 0;

    private image(amenityId: string, imageUrl: string, position: number, id?: string): VenueAmenityImage {
        this.imageSeq += 1;
        return { id: id ?? `new-image-${this.imageSeq}`, amenityId, imageUrl, position, createdAt: new Date() };
    }

    async create(params: CreateVenueAmenityData, imageUrls: string[]): Promise<VenueAmenityWithImages> {
        const id = `amenity-${this.items.length + 1}`;
        const created: VenueAmenityWithImages = {
            id,
            name: params.name,
            position: params.position,
            description: params.description,
            imageUrl: null,
            videoUrl: params.videoUrl,
            venueId: params.venueId,
            createdAt: new Date(2026, 0, this.items.length + 1),
            updatedAt: new Date(),
            images: imageUrls.map((imageUrl, position) => this.image(id, imageUrl, position)),
        };
        this.items.push(created);
        return created;
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

    async update(params: UpdateVenueAmenityData, images?: VenueAmenityImageInput[]) {
        if (this.failUpdate) throw new Error("banco fora");
        this.updates += 1;
        const current = await this.getById(params.amenityId);
        if (!current) throw new Error("missing");
        current.name = params.name;
        current.position = params.position;
        current.description = params.description;
        current.videoUrl = params.videoUrl;
        if (images) {
            current.images = images.map((input, position) => this.image(current.id, input.imageUrl, position, input.id));
        }
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
    failOn?: string;

    upload = async (file: AmenityImageFile) => {
        const name = file.buffer.toString();
        if (name === this.failOn) throw new HttpBadRequestError("S3 fora");
        const url = `https://bucket.s3.region.amazonaws.com/${name}.webp`;
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

function url(name: string) {
    return `https://bucket.s3.region.amazonaws.com/${name}.webp`;
}

function savedImage(id: string, position: number): VenueAmenityImage {
    return { id, amenityId: "amenity-1", imageUrl: url(id), position, createdAt: new Date() };
}

function row(overrides: Partial<VenueAmenityWithImages> = {}): VenueAmenityWithImages {
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
        images: [],
        ...overrides,
    };
}

function withPhotos(...ids: string[]) {
    return row({ images: ids.map((id, position) => savedImage(id, position)) });
}

function urlsOf(amenity: VenueAmenityWithImages) {
    return amenity.images.map((image) => image.imageUrl);
}

const YOUTUBE = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

const editor = authorizerFor({ "venue-a": "VIEW_VENUE_AMENITIES,EDIT_VENUE_AMENITIES" });
const viewer = authorizerFor({ "venue-a": "VIEW_VENUE_AMENITIES" });
const otherVenue = authorizerFor({ "venue-b": "VIEW_VENUE_AMENITIES,EDIT_VENUE_AMENITIES" });

function createParams(input: Record<string, unknown>) {
    return createVenueAmenitySchema.parse({ venueId: "venue-a", ...input });
}

function updateParams(input: Record<string, unknown>) {
    return updateVenueAmenitySchema.parse({ amenityId: "amenity-1", name: "Piscina", ...input });
}

function setup(authorizer = editor, ...items: VenueAmenityWithImages[]) {
    const repository = new FakeVenueAmenityRepository();
    repository.items.push(...items);
    const storage = new FakeImageStorage();
    return {
        repository,
        storage,
        create: new CreateVenueAmenityUseCase(repository, authorizer, storage),
        update: new UpdateVenueAmenityUseCase(repository, authorizer, storage),
        remove: new DeleteVenueAmenityUseCase(repository, authorizer, storage),
        list: new ListVenueAmenityUseCase(repository, authorizer),
    };
}

describe("venue amenity", () => {
    it("cria no fim da lista e lista ordenada, inclusive vazia", async () => {
        const { create, list } = setup();

        const empty = await list.execute("user-1", "venue-a");
        expect(empty.data).toEqual([]);

        await create.execute("user-1", createParams({ name: "Piscina aquecida" }));
        await create.execute("user-1", createParams({ name: "Telao" }));

        const listed = await list.execute("user-1", "venue-a");
        expect(listed.data.map((item) => item.position)).toEqual([0, 1]);
        expect(listed.data[1].name).toBe("Telao");
        expect(listed.data[1]).toMatchObject({ description: null, videoUrl: null, images: [] });
    });

    it("recusa nome vazio, nome longo, posicao negativa e usuario sem token", async () => {
        expect(() => createParams({ name: "   " })).toThrow(ZodError);
        expect(() => createParams({ name: "a".repeat(121) })).toThrow(ZodError);
        expect(() => updateParams({ position: -1 })).toThrow(ZodError);

        const { create } = setup();
        await expect(create.execute(undefined, createParams({ name: "Piscina" }))).rejects.toBeInstanceOf(HttpTokenError);
    });

    it("recusa nome duplicado no mesmo venue", async () => {
        const { create, repository } = setup();
        await create.execute("user-1", createParams({ name: "Piscina aquecida" }));
        await expect(create.execute("user-1", createParams({ name: "piscina aquecida" }))).rejects.toBeInstanceOf(HttpConflictError);
        expect(repository.items).toHaveLength(1);
    });

    it("recusa listar e gravar sem a permissao daquele venue, sem subir foto", async () => {
        const repository = new FakeVenueAmenityRepository();
        repository.items.push({ ...withPhotos("antiga"), name: "Salao interno" });
        const storage = new FakeImageStorage();

        const list = new ListVenueAmenityUseCase(repository, otherVenue);
        const create = new CreateVenueAmenityUseCase(repository, viewer, storage);
        const update = new UpdateVenueAmenityUseCase(repository, viewer, storage);
        const remove = new DeleteVenueAmenityUseCase(repository, otherVenue, storage);

        await expect(list.execute("user-1", "venue-a")).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(create.execute("user-1", createParams({ name: "Telao" }), [photo("nova")]))
            .rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(update.execute("user-1", updateParams({ name: "Nome novo", images: [{ newIndex: 0 }] }), [photo("nova")]))
            .rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(remove.execute("user-1", "amenity-1")).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(repository.updates).toBe(0);
        expect(repository.deletes).toBe(0);
        expect(repository.items).toHaveLength(1);
        expect(urlsOf(repository.items[0])).toEqual([url("antiga")]);
        expect(storage.uploaded).toEqual([]);
        expect(storage.removed).toEqual([]);
    });

    it("nao altera caracteristica de outro venue e responde 404 quando nao existe", async () => {
        const { update, repository } = setup(otherVenue, row({ name: "Telao", position: 3 }));
        await expect(update.execute("user-1", updateParams({ name: "Invadida" }))).rejects.toBeInstanceOf(HttpForbiddenError);
        expect(repository.items[0].name).toBe("Telao");

        const missing = setup();
        await expect(missing.update.execute("user-1", updateParams({ amenityId: "nao-existe", name: "Salao" })))
            .rejects.toBeInstanceOf(HttpResourceNotFoundError);
    });

    it("grava descricao sem espacos nas pontas, vazia como nulo e recusa acima de 500", async () => {
        expect(createParams({ name: "Piscina", description: "  Aquecida  " }).description).toBe("Aquecida");
        expect(createParams({ name: "Piscina", description: "   " }).description).toBeNull();
        expect(createParams({ name: "Piscina" }).description).toBeUndefined();
        expect(() => createParams({ name: "Piscina", description: "a".repeat(501) })).toThrow(ZodError);

        const { create, repository } = setup();
        await create.execute("user-1", createParams({ name: "Piscina" }));
        expect(repository.items[0].description).toBeNull();
    });

    it("aceita so link https do YouTube como video", () => {
        for (const link of [
            YOUTUBE,
            "https://youtu.be/dQw4w9WgXcQ",
            "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
        ]) {
            expect(isYoutubeUrl(link)).toBe(true);
            expect(createParams({ name: "Piscina", videoUrl: link }).videoUrl).toBe(link);
        }

        for (const link of [
            "https://cdn.example.com/tour.mp4",
            "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://vimeo.com/123456",
            "https://user:pass@www.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://www.youtube.com/watch?v=curto",
        ]) {
            expect(isYoutubeUrl(link)).toBe(false);
            expect(() => createParams({ name: "Piscina", videoUrl: link })).toThrow(ZodError);
        }

        expect(isTourVideoUrl("https://cdn.example.com/tour.mp4")).toBe(true);
        expect(createParams({ name: "Piscina", videoUrl: "" }).videoUrl).toBeNull();
        expect(updateParams({ videoUrl: "  " }).videoUrl).toBeNull();
        expect(updateParams({}).videoUrl).toBeUndefined();
    });

    it("cria com tres fotos na ordem dos arquivos, video e descricao, e ignora imageUrl do cliente", async () => {
        const { create, repository, storage } = setup();

        const params = createParams({
            name: "Piscina",
            description: "Aquecida",
            videoUrl: YOUTUBE,
            imageUrl: "https://atacante.com/x.png",
        });
        await create.execute("user-1", params, [photo("a"), photo("b"), photo("c")]);

        expect(repository.items[0]).toMatchObject({ description: "Aquecida", videoUrl: YOUTUBE, imageUrl: null });
        expect(repository.items[0].images.map((image) => [image.imageUrl, image.position])).toEqual([
            [url("a"), 0],
            [url("b"), 1],
            [url("c"), 2],
        ]);
        expect(storage.uploaded).toHaveLength(3);
    });

    it("cria com uma foto e sem foto", async () => {
        const { create, repository } = setup();
        await create.execute("user-1", createParams({ name: "Piscina" }), [photo("a")]);
        await create.execute("user-1", createParams({ name: "Telao" }));
        expect(urlsOf(repository.items[0])).toEqual([url("a")]);
        expect(repository.items[1].images).toEqual([]);
    });

    it("recusa quatro fotos no criar sem subir nem gravar", async () => {
        const { create, repository, storage } = setup();
        await expect(create.execute("user-1", createParams({ name: "Piscina" }), [photo("a"), photo("b"), photo("c"), photo("d")]))
            .rejects.toThrow(AMENITY_IMAGE_LIMIT_MESSAGE);
        expect(repository.items).toEqual([]);
        expect(storage.uploaded).toEqual([]);
    });

    it("recusa arquivo que nao e imagem ou passa de 5 MB sem subir nem gravar", async () => {
        const { create, update, repository, storage } = setup(editor, withPhotos("antiga"));

        await expect(create.execute("user-1", createParams({ name: "Telao" }), [photo("ok"), photo("doc", { mimetype: "application/pdf" })]))
            .rejects.toBeInstanceOf(HttpBadRequestError);
        await expect(update.execute("user-1", updateParams({ images: [{ newIndex: 0 }] }), [photo("grande", { size: 5 * 1024 * 1024 + 1 })]))
            .rejects.toBeInstanceOf(HttpBadRequestError);

        expect(repository.items).toHaveLength(1);
        expect(urlsOf(repository.items[0])).toEqual([url("antiga")]);
        expect(repository.updates).toBe(0);
        expect(storage.uploaded).toEqual([]);
        expect(storage.removed).toEqual([]);
    });

    it("traduz o erro do multer em 400 com a mensagem da caracteristica", () => {
        const limit = amenityUploadError(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "files"));
        const size = amenityUploadError(new multer.MulterError("LIMIT_FILE_SIZE", "files"));
        const other = amenityUploadError(new multer.MulterError("LIMIT_PART_COUNT"));
        expect(limit).toBeInstanceOf(HttpBadRequestError);
        expect((limit as Error).message).toBe(AMENITY_IMAGE_LIMIT_MESSAGE);
        expect((size as Error).message).toBe(AMENITY_IMAGE_SIZE_MESSAGE);
        expect((other as Error).message).toBe(AMENITY_IMAGE_INVALID_MESSAGE);
        const unknown = new Error("outro");
        expect(amenityUploadError(unknown)).toBe(unknown);
    });

    it("excluir remove a linha e todas as fotos", async () => {
        const { remove, repository, storage } = setup(editor, { ...withPhotos("a", "b", "c"), videoUrl: YOUTUBE });

        await remove.execute("user-1", "amenity-1");

        expect(repository.items).toEqual([]);
        expect(storage.removed).toEqual([url("a"), url("b"), url("c")]);
    });

    it("caracteristica antiga so com nome continua editavel e excluivel sem tocar no storage", async () => {
        const { update, remove, repository, storage } = setup(editor, row());

        await update.execute("user-1", updateParams({ name: "Piscina coberta" }));
        expect(repository.items[0]).toMatchObject({ name: "Piscina coberta", description: null, videoUrl: null, images: [] });

        await remove.execute("user-1", "amenity-1");
        expect(storage.uploaded).toEqual([]);
        expect(storage.removed).toEqual([]);
    });

    it("reordena tres fotos salvas sem tocar no storage", async () => {
        const { update, repository, storage } = setup(editor, withPhotos("a", "b", "c"));

        await update.execute("user-1", updateParams({ images: [{ id: "c" }, { id: "a" }, { id: "b" }] }));

        expect(repository.items[0].images.map((image) => [image.id, image.position])).toEqual([
            ["c", 0],
            ["a", 1],
            ["b", 2],
        ]);
        expect(storage.uploaded).toEqual([]);
        expect(storage.removed).toEqual([]);
    });

    it("remove uma, adiciona uma no meio e apaga do storage so a removida", async () => {
        const { update, repository, storage } = setup(editor, withPhotos("a", "b", "c"));

        await update.execute("user-1", updateParams({ images: [{ id: "a" }, { newIndex: 0 }, { id: "c" }] }), [photo("nova")]);

        expect(urlsOf(repository.items[0])).toEqual([url("a"), url("nova"), url("c")]);
        expect(repository.items[0].images.map((image) => image.position)).toEqual([0, 1, 2]);
        expect(storage.removed).toEqual([url("b")]);
    });

    it("lista vazia remove todas as fotos e mantem video e descricao", async () => {
        const { update, repository, storage } = setup(editor, { ...withPhotos("a", "b"), videoUrl: YOUTUBE, description: "Aquecida" });

        await update.execute("user-1", updateParams({ images: [] }));

        expect(repository.items[0]).toMatchObject({ images: [], videoUrl: YOUTUBE, description: "Aquecida" });
        expect(storage.removed).toEqual([url("a"), url("b")]);
    });

    it("recusa lista final com mais de tres fotos sem subir nem gravar", async () => {
        const { update, repository, storage } = setup(editor, withPhotos("a", "b"));

        await expect(update.execute(
            "user-1",
            updateParams({ images: [{ id: "a" }, { id: "b" }, { newIndex: 0 }, { newIndex: 1 }] }),
            [photo("x"), photo("y")],
        )).rejects.toThrow(AMENITY_IMAGE_LIMIT_MESSAGE);

        expect(repository.updates).toBe(0);
        expect(storage.uploaded).toEqual([]);
        expect(urlsOf(repository.items[0])).toEqual([url("a"), url("b")]);
    });

    it("recusa id de outra caracteristica, id repetido, newIndex fora e arquivo sem referencia", async () => {
        const cases: [Record<string, unknown>, AmenityImageFile[]][] = [
            [{ images: [{ id: "de-outra" }] }, []],
            [{ images: [{ id: "a" }, { id: "a" }] }, []],
            [{ images: [{ newIndex: 1 }] }, [photo("x")]],
            [{ images: [{ newIndex: 0 }, { newIndex: 0 }] }, [photo("x"), photo("y")]],
            [{ images: [{ id: "a" }] }, [photo("x")]],
        ];
        for (const [input, files] of cases) {
            const { update, repository, storage } = setup(editor, withPhotos("a"));
            await expect(update.execute("user-1", updateParams(input), files)).rejects.toThrow(AMENITY_IMAGE_INVALID_MESSAGE);
            expect(repository.updates).toBe(0);
            expect(storage.uploaded).toEqual([]);
        }
        expect(() => updateParams({ images: [{ newIndex: -1 }] })).toThrow(ZodError);
        expect(() => updateParams({ images: [{ id: "a", imageUrl: "https://atacante.com/x.png" }] })).toThrow(ZodError);
    });

    it("falha no segundo upload remove o primeiro e nao grava", async () => {
        const { update, repository, storage } = setup(editor, withPhotos("a"));
        storage.failOn = "y";

        await expect(update.execute(
            "user-1",
            updateParams({ images: [{ id: "a" }, { newIndex: 0 }, { newIndex: 1 }] }),
            [photo("x"), photo("y")],
        )).rejects.toBeInstanceOf(HttpBadRequestError);

        expect(repository.updates).toBe(0);
        expect(storage.removed).toEqual([url("x")]);
        expect(urlsOf(repository.items[0])).toEqual([url("a")]);
    });

    it("falha ao gravar remove as novas e mantem as antigas no storage", async () => {
        const { update, repository, storage } = setup(editor, withPhotos("a", "b"));
        repository.failUpdate = true;

        await expect(update.execute("user-1", updateParams({ images: [{ newIndex: 0 }] }), [photo("x")]))
            .rejects.toThrow("banco fora");

        expect(storage.removed).toEqual([url("x")]);
        expect(urlsOf(repository.items[0])).toEqual([url("a"), url("b")]);
    });

    it("editar sem images mantem as fotos e com arquivo recusa", async () => {
        const { update, repository, storage } = setup(editor, { ...withPhotos("a", "b"), videoUrl: YOUTUBE });

        await update.execute("user-1", updateParams({ name: "Piscina coberta", videoUrl: "" }));
        expect(repository.items[0]).toMatchObject({ name: "Piscina coberta", videoUrl: null });
        expect(urlsOf(repository.items[0])).toEqual([url("a"), url("b")]);

        await expect(update.execute("user-1", updateParams({}), [photo("x")])).rejects.toThrow(AMENITY_IMAGE_INVALID_MESSAGE);
        expect(storage.uploaded).toEqual([]);
        expect(storage.removed).toEqual([]);
    });
});

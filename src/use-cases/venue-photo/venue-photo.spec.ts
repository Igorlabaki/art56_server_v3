import { describe, expect, it } from "vitest";
import multer from "multer";
import { VenuePhoto } from "@prisma/client";
import { HttpBadRequestError } from "../../errors/errors-type/htttp-bad-request-error";
import { HttpForbiddenError } from "../../errors/errors-type/http-forbidden-error";
import {
    StoredVenuePhoto,
    VENUE_PHOTO_MAX_BYTES,
    VENUE_PHOTO_SIZE_MESSAGE,
    VENUE_PHOTO_TYPE_MESSAGE,
    VenuePhotoFile,
    VenuePhotoStorage,
    venuePhotoStorageKey,
    venuePhotoUploadError,
} from "../../functions/venue-photo-image";
import { grantPhotoPermission } from "../../functions/venue-photo-permission";
import {
    CreateVenuePhotoData,
    VenuePhotoRepositoryInterface,
    VenuePhotoUsages,
} from "../../repositories/interface/venue-photo-repository-interface";
import { VenuePhotoUseCase } from "./use-case-venue-photo";
import { VenuePhotoAuthorizer } from "./venue-photo-authorizer";
import { VenuePhotoInUseError } from "./venue-photo-in-use-error";

const emptyUsages = (): VenuePhotoUsages => ({
    siteImages: [],
    services: [],
    amenities: [],
    emailConfigs: [],
});

function authorizerFor(permissionsByVenue: Record<string, string>) {
    return new VenuePhotoAuthorizer(
        {
            getById: async ({ venueId }) => {
                if (venueId !== "venue-a") return null;
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

class FakeVenuePhotoRepository implements VenuePhotoRepositoryInterface {
    items: VenuePhoto[] = [];
    usages = new Map<string, VenuePhotoUsages>();
    failCreateOn = 0;
    creates = 0;
    deletes: string[] = [];

    async create(data: CreateVenuePhotoData) {
        this.creates += 1;
        if (this.failCreateOn > 0 && this.creates >= this.failCreateOn) {
            throw new Error("banco fora");
        }
        const row: VenuePhoto = {
            id: `photo-${this.items.length + 1}`,
            venueId: data.venueId,
            url: data.url,
            storageKey: data.storageKey,
            width: data.width,
            height: data.height,
            sizeBytes: data.sizeBytes,
            description: data.description ?? null,
            createdAt: new Date(2026, 10, this.items.length + 1),
            updatedAt: new Date(),
        };
        this.items.push(row);
        return row;
    }

    async listByVenue(venueId: string) {
        return this.items
            .filter((item) => item.venueId === venueId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async getById(id: string) {
        return this.items.find((item) => item.id === id) ?? null;
    }

    async updateDescription(id: string, description: string | null) {
        const current = await this.getById(id);
        if (!current) throw new Error("missing");
        current.description = description;
        return current;
    }

    async delete(id: string) {
        this.deletes.push(id);
        this.items = this.items.filter((item) => item.id !== id);
    }

    async listUsages(photoId: string) {
        return this.usages.get(photoId) ?? emptyUsages();
    }
}

class FakeStorage implements VenuePhotoStorage {
    removed: string[] = [];
    uploads = 0;

    upload = async (venueId: string): Promise<StoredVenuePhoto> => {
        this.uploads += 1;
        const storageKey = venuePhotoStorageKey(venueId, `file-${this.uploads}`);
        return {
            url: `https://bucket.s3.region.amazonaws.com/${storageKey}`,
            storageKey,
            width: 800,
            height: 600,
            sizeBytes: 1200,
        };
    };

    remove = async (storageKey: string) => {
        this.removed.push(storageKey);
    };
}

function file(name: string, overrides: Partial<VenuePhotoFile> = {}): VenuePhotoFile {
    return { buffer: Buffer.from(name), size: 1000, mimetype: "image/png", ...overrides };
}

function useCase(permissions: Record<string, string>, repository = new FakeVenuePhotoRepository(), storage = new FakeStorage()) {
    return {
        repository,
        storage,
        useCase: new VenuePhotoUseCase(repository, authorizerFor(permissions), storage),
    };
}

describe("venue photo library", () => {
    it("builds the webp key inside the venue folder", () => {
        expect(venuePhotoStorageKey("venue-a", "abc")).toBe("venues/venue-a/photos/abc.webp");
    });

    it("uploads one and many files and stores the venue key", async () => {
        const one = useCase({ "venue-a": "EDIT_VENUE_PHOTOS" });
        const single = await one.useCase.upload("user-1", "venue-a", [file("a")]);
        expect(single.count).toBe(1);
        expect(single.data[0].storageKey).toBe("venues/venue-a/photos/file-1.webp");

        const many = useCase({ "venue-a": "EDIT_VENUE_PHOTOS" });
        const batch = await many.useCase.upload("user-1", "venue-a", [file("a"), file("b"), file("c")]);
        expect(batch.data.map((item) => item.storageKey)).toEqual([
            "venues/venue-a/photos/file-1.webp",
            "venues/venue-a/photos/file-2.webp",
            "venues/venue-a/photos/file-3.webp",
        ]);
    });

    it("rejects a non-image and a file over 5 MB", async () => {
        const ctx = useCase({ "venue-a": "EDIT_VENUE_PHOTOS" });
        await expect(ctx.useCase.upload("user-1", "venue-a", [file("a", { mimetype: "application/pdf" })]))
            .rejects.toMatchObject({ statusCode: 400, message: VENUE_PHOTO_TYPE_MESSAGE });
        await expect(ctx.useCase.upload("user-1", "venue-a", [file("a", { size: VENUE_PHOTO_MAX_BYTES + 1 })]))
            .rejects.toMatchObject({ statusCode: 400, message: VENUE_PHOTO_SIZE_MESSAGE });
        expect(ctx.storage.uploads).toBe(0);
    });

    it("returns 403 without the photo permission", async () => {
        const ctx = useCase({ "venue-a": "VIEW_VENUE_SITES" });
        await expect(ctx.useCase.upload("user-1", "venue-a", [file("a")])).rejects.toBeInstanceOf(HttpForbiddenError);
        await expect(ctx.useCase.list("user-1", "venue-a")).rejects.toMatchObject({ statusCode: 403 });
    });

    it("lists photos of the venue newest first", async () => {
        const ctx = useCase({ "venue-a": "VIEW_VENUE_PHOTOS,EDIT_VENUE_PHOTOS" });
        await ctx.useCase.upload("user-1", "venue-a", [file("old")]);
        ctx.repository.items[0].createdAt = new Date(2026, 0, 1);
        await ctx.useCase.upload("user-1", "venue-a", [file("new")]);
        ctx.repository.items[1].createdAt = new Date(2026, 5, 1);
        const listed = await ctx.useCase.list("user-1", "venue-a");
        expect(listed.data.map((item) => item.id)).toEqual(["photo-2", "photo-1"]);
    });

    it("updates only the description", async () => {
        const ctx = useCase({ "venue-a": "EDIT_VENUE_PHOTOS,VIEW_VENUE_PHOTOS" });
        await ctx.useCase.upload("user-1", "venue-a", [file("a")]);
        const before = ctx.repository.items[0];
        const updated = await ctx.useCase.updateDescription("user-1", before.id, "Piscina");
        expect(updated.data.description).toBe("Piscina");
        expect(updated.data.url).toBe(before.url);
        expect(updated.data.storageKey).toBe(before.storageKey);
    });

    it("deletes the object and the row when nothing uses the photo", async () => {
        const ctx = useCase({ "venue-a": "EDIT_VENUE_PHOTOS" });
        await ctx.useCase.upload("user-1", "venue-a", [file("a")]);
        const photo = ctx.repository.items[0];
        await ctx.useCase.delete("user-1", photo.id);
        expect(ctx.storage.removed).toEqual([photo.storageKey]);
        expect(ctx.repository.items).toHaveLength(0);
    });

    it("returns 409 and the usages when the photo is still referenced", async () => {
        const ctx = useCase({ "venue-a": "EDIT_VENUE_PHOTOS" });
        await ctx.useCase.upload("user-1", "venue-a", [file("a")]);
        const photo = ctx.repository.items[0];
        const usages: VenuePhotoUsages = {
            ...emptyUsages(),
            services: [{ id: "svc-1", name: "DJ" }],
        };
        ctx.repository.usages.set(photo.id, usages);
        await expect(ctx.useCase.delete("user-1", photo.id)).rejects.toMatchObject({
            statusCode: 409,
            usages,
        });
        await expect(ctx.useCase.delete("user-1", photo.id)).rejects.toBeInstanceOf(VenuePhotoInUseError);
        expect(ctx.storage.removed).toEqual([]);
        expect(ctx.repository.items).toHaveLength(1);
    });

    it("removes new s3 keys when saving the rows fails", async () => {
        const repository = new FakeVenuePhotoRepository();
        repository.failCreateOn = 2;
        const ctx = useCase({ "venue-a": "EDIT_VENUE_PHOTOS" }, repository);
        await expect(ctx.useCase.upload("user-1", "venue-a", [file("a"), file("b")])).rejects.toThrow("banco fora");
        expect(ctx.storage.removed).toEqual([
            "venues/venue-a/photos/file-1.webp",
            "venues/venue-a/photos/file-2.webp",
        ]);
        expect(repository.items).toHaveLength(0);
    });

    it("does not duplicate a permission that is already present", () => {
        expect(grantPhotoPermission("VIEW_VENUE_SITES", "VIEW_VENUE_SITES", "VIEW_VENUE_PHOTOS"))
            .toBe("VIEW_VENUE_SITES,VIEW_VENUE_PHOTOS");
        expect(grantPhotoPermission("VIEW_VENUE_SITES,VIEW_VENUE_PHOTOS", "VIEW_VENUE_SITES", "VIEW_VENUE_PHOTOS"))
            .toBe("VIEW_VENUE_SITES,VIEW_VENUE_PHOTOS");
        expect(grantPhotoPermission("EDIT_VENUE_INFO", "EDIT_VENUE_SITE", "EDIT_VENUE_PHOTOS"))
            .toBe("EDIT_VENUE_INFO");
    });

    it("maps multer size errors to 400", () => {
        const error = new multer.MulterError("LIMIT_FILE_SIZE");
        expect(venuePhotoUploadError(error)).toBeInstanceOf(HttpBadRequestError);
    });
});

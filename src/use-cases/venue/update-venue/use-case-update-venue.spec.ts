import { describe, expect, it, vi } from "vitest";
import { VenueLinkKind, VenueLinkRow } from "../../../functions/venue-link";
import { VenueLinkRecord, VenueLinkRepository } from "../../../repositories/interface/venue-link-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { UpdateVenueInfoSchemaDb } from "../../../zod/venue/update-info-venue-params-schema";
import { UpdateVenueSchemaDb } from "../../../zod/venue/update-venue-params-schema";
import { UpdateInfoVenueUseCase } from "../update-info-venue/use-case-update-info-venue";
import { UpdateVenueUseCase } from "./use-case-update-venue";

const venueId = "11111111-1111-4111-8111-111111111111";

function venue() {
    return {
        id: venueId,
        name: "AR756",
        userVenuePermissions: [{ permissions: "EDIT_VENUE_INFO" }],
    };
}

function linkRecord(links: VenueLinkRow[] = []): VenueLinkRecord {
    return {
        id: venueId,
        name: "AR756",
        logoUrl: null,
        slogan: null,
        proposalPrimaryColor: null,
        proposalSecondaryColor: null,
        proposalTextColor: null,
        url: "https://www.ar756.com/",
        instagramUrl: "https://www.instagram.com/ar756_/",
        facebookUrl: "https://www.facebook.com/profile.php?id=100085832906065",
        tiktokUrl: "https://www.tiktok.com/@ar756_",
        whatsappNumber: "",
        email: null,
        tourVideoUrl: null,
        street: "Rua A",
        streetNumber: "10",
        neighborhood: "Centro",
        city: "Ubatuba",
        state: "SP",
        organizationUrl: null,
        links,
    };
}

function linkStore(found: VenueLinkRecord) {
    const inserted: VenueLinkRow[][] = [];
    const removed: VenueLinkKind[][] = [];
    const links: VenueLinkRepository = {
        findByKey: async () => found,
        replace: async () => undefined,
        insertMissing: async (_id, rows) => {
            inserted.push(rows);
        },
        deleteKinds: async (_id, kinds) => {
            removed.push(kinds);
        },
    };
    return { links, inserted, removed };
}

function venues() {
    const update = vi.fn(async () => venue());
    const repository = {
        getById: async () => venue(),
        update,
    } as unknown as VenueRepositoryInterface;
    return { repository, update };
}

function payload(data: UpdateVenueSchemaDb["data"]): UpdateVenueSchemaDb {
    return { venueId, userId: "user-1", data };
}

describe("update do espaco", () => {
    it("nao escreve nas quatro colunas", async () => {
        const { repository, update } = venues();
        const { links, inserted } = linkStore(linkRecord());
        await new UpdateVenueUseCase(repository, links).execute(payload({
            name: "AR756",
            url: "https://apagaria.com",
            instagramUrl: "",
            facebookUrl: "",
            tiktokUrl: "",
            pricingModel: "PER_DAY",
        }));
        const saved = update.mock.calls[0]?.[0] as UpdateVenueSchemaDb;
        expect(saved.data).not.toHaveProperty("url");
        expect(saved.data).not.toHaveProperty("instagramUrl");
        expect(saved.data).not.toHaveProperty("facebookUrl");
        expect(saved.data).not.toHaveProperty("tiktokUrl");
        expect(saved.data.name).toBe("AR756");
        expect(inserted).toEqual([]);
    });

    it("WhatsApp e tour nascem desligados e somem se o campo esvazia", async () => {
        const born = linkStore(linkRecord());
        const { repository } = venues();
        await new UpdateVenueUseCase(repository, born.links).execute(payload({
            whatsappNumber: "(11) 99999-9999",
            tourVideoUrl: "https://www.youtube.com/watch?v=TfdZorJpR1I",
            pricingModel: "PER_DAY",
        }));
        expect(born.inserted[0]).toEqual([
            { kind: "WHATSAPP", url: "created", visible: false, position: 0 },
            { kind: "TOUR_VIDEO", url: "created", visible: false, position: 1 },
        ]);
        expect(born.removed).toEqual([]);

        const existing = linkRecord([
            { kind: "WHATSAPP", url: "created", visible: true, position: 0 },
            { kind: "TOUR_VIDEO", url: "created", visible: false, position: 1 },
        ]);
        const gone = linkStore(existing);
        await new UpdateVenueUseCase(venues().repository, gone.links).execute(payload({
            whatsappNumber: "",
            tourVideoUrl: null,
            pricingModel: "PER_DAY",
        }));
        expect(gone.removed).toEqual([["WHATSAPP", "TOUR_VIDEO"]]);
        expect(gone.inserted).toEqual([]);
        expect(existing.links[0]?.visible).toBe(true);
    });

    it("mudar o numero nao muda o visible", async () => {
        const found = linkRecord([
            { kind: "WHATSAPP", url: "created", visible: true, position: 3 },
            { kind: "TOUR_VIDEO", url: "created", visible: false, position: 4 },
        ]);
        const box = linkStore(found);
        await new UpdateVenueUseCase(venues().repository, box.links).execute(payload({
            whatsappNumber: "5511888888888",
            tourVideoUrl: "https://cdn.example.com/tour.mp4",
            pricingModel: "PER_DAY",
        }));
        expect(box.inserted).toEqual([]);
        expect(box.removed).toEqual([]);
        expect(found.links.map((row) => row.visible)).toEqual([true, false]);
    });

    it("update info tambem nao escreve nas quatro colunas", async () => {
        const updateInfo = vi.fn(async () => venue());
        const repository = {
            getById: async () => venue(),
            updateInfo,
        } as unknown as VenueRepositoryInterface;
        const param: UpdateVenueInfoSchemaDb = {
            userId: "user-1",
            venueId,
            name: "AR756",
            url: "https://apagaria.com",
            instagramUrl: "https://www.instagram.com/ar756_/",
            facebookUrl: "https://www.facebook.com/casa",
            tiktokUrl: "https://www.tiktok.com/@ar756_",
            description: "Casa",
            state: "SP",
            city: "Ubatuba",
            isShowOnOrganization: true,
        };
        await new UpdateInfoVenueUseCase(repository).execute(param);
        const saved = updateInfo.mock.calls[0]?.[0] as UpdateVenueInfoSchemaDb;
        expect(saved.name).toBe("AR756");
        expect(saved.city).toBe("Ubatuba");
        expect(saved).not.toHaveProperty("url");
        expect(saved).not.toHaveProperty("instagramUrl");
        expect(saved).not.toHaveProperty("facebookUrl");
        expect(saved).not.toHaveProperty("tiktokUrl");
    });
});

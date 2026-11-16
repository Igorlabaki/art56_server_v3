import { VenuePhoto } from "@prisma/client";

export type VenuePhotoUsage = { id: string; name: string };

export type VenuePhotoUsages = {
    siteImages: VenuePhotoUsage[];
    services: VenuePhotoUsage[];
    amenities: VenuePhotoUsage[];
    emailConfigs: VenuePhotoUsage[];
};

export type CreateVenuePhotoData = {
    venueId: string;
    url: string;
    storageKey: string;
    width: number | null;
    height: number | null;
    sizeBytes: number | null;
    description?: string | null;
};

export interface VenuePhotoRepositoryInterface {
    create: (data: CreateVenuePhotoData) => Promise<VenuePhoto>;
    listByVenue: (venueId: string) => Promise<VenuePhoto[]>;
    getById: (id: string) => Promise<VenuePhoto | null>;
    updateDescription: (id: string, description: string | null) => Promise<VenuePhoto>;
    delete: (id: string) => Promise<void>;
    listUsages: (photoId: string) => Promise<VenuePhotoUsages>;
}

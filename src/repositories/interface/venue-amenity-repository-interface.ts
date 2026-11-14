import { VenueAmenity, VenueAmenityImage } from "@prisma/client";

export type VenueAmenityWithImages = VenueAmenity & { images: VenueAmenityImage[] };

export type VenueAmenityContent = {
    description: string | null;
    videoUrl: string | null;
};

export type CreateVenueAmenityData = VenueAmenityContent & {
    venueId: string;
    name: string;
    position: number;
};

export type UpdateVenueAmenityData = VenueAmenityContent & {
    amenityId: string;
    name: string;
    position: number;
};

export type VenueAmenityImageInput = { id?: string; imageUrl: string };

export interface VenueAmenityRepositoryInterface {
    create: (params: CreateVenueAmenityData, imageUrls: string[]) => Promise<VenueAmenityWithImages>;
    listByVenue: (venueId: string) => Promise<VenueAmenityWithImages[]>;
    getById: (id: string) => Promise<VenueAmenityWithImages | null>;
    findByName: (venueId: string, name: string) => Promise<VenueAmenity | null>;
    nextPosition: (venueId: string) => Promise<number>;
    update: (params: UpdateVenueAmenityData, images?: VenueAmenityImageInput[]) => Promise<VenueAmenityWithImages>;
    delete: (id: string) => Promise<VenueAmenity>;
}

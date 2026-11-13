import { VenueAmenity } from "@prisma/client";

export type VenueAmenityContent = {
    description: string | null;
    imageUrl: string | null;
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

export interface VenueAmenityRepositoryInterface {
    create: (params: CreateVenueAmenityData) => Promise<VenueAmenity>;
    listByVenue: (venueId: string) => Promise<VenueAmenity[]>;
    getById: (id: string) => Promise<VenueAmenity | null>;
    findByName: (venueId: string, name: string) => Promise<VenueAmenity | null>;
    nextPosition: (venueId: string) => Promise<number>;
    update: (params: UpdateVenueAmenityData) => Promise<VenueAmenity>;
    delete: (id: string) => Promise<VenueAmenity>;
}

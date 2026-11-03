import { VenueAmenity } from "@prisma/client";
import { CreateVenueAmenityParams } from "../../zod/venue-amenity/create-venue-amenity-schema";
import { UpdateVenueAmenityParams } from "../../zod/venue-amenity/update-venue-amenity-schema";

export interface VenueAmenityRepositoryInterface {
    create: (params: CreateVenueAmenityParams & { position: number }) => Promise<VenueAmenity>;
    listByVenue: (venueId: string) => Promise<VenueAmenity[]>;
    getById: (id: string) => Promise<VenueAmenity | null>;
    findByName: (venueId: string, name: string) => Promise<VenueAmenity | null>;
    nextPosition: (venueId: string) => Promise<number>;
    update: (params: UpdateVenueAmenityParams & { position: number }) => Promise<VenueAmenity>;
    delete: (id: string) => Promise<VenueAmenity>;
}

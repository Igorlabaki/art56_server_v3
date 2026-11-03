import { PrismaClient, VenueAmenity } from "@prisma/client";
import { VenueAmenityRepositoryInterface } from "../interface/venue-amenity-repository-interface";
import { CreateVenueAmenityParams } from "../../zod/venue-amenity/create-venue-amenity-schema";
import { UpdateVenueAmenityParams } from "../../zod/venue-amenity/update-venue-amenity-schema";

export class PrismaVenueAmenityRepository implements VenueAmenityRepositoryInterface {
    constructor(private readonly prisma: PrismaClient) {}

    async create(params: CreateVenueAmenityParams & { position: number }): Promise<VenueAmenity> {
        return this.prisma.venueAmenity.create({
            data: {
                venueId: params.venueId,
                name: params.name,
                position: params.position,
            },
        });
    }

    async listByVenue(venueId: string): Promise<VenueAmenity[]> {
        return this.prisma.venueAmenity.findMany({
            where: { venueId },
            orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        });
    }

    async getById(id: string): Promise<VenueAmenity | null> {
        return this.prisma.venueAmenity.findFirst({ where: { id } });
    }

    async findByName(venueId: string, name: string): Promise<VenueAmenity | null> {
        return this.prisma.venueAmenity.findFirst({
            where: { venueId, name },
        });
    }

    async nextPosition(venueId: string): Promise<number> {
        const result = await this.prisma.venueAmenity.aggregate({
            where: { venueId },
            _max: { position: true },
        });
        if (result._max.position == null) return 0;
        return result._max.position + 1;
    }

    async update(params: UpdateVenueAmenityParams & { position: number }): Promise<VenueAmenity> {
        return this.prisma.venueAmenity.update({
            where: { id: params.amenityId },
            data: {
                name: params.name,
                position: params.position,
            },
        });
    }

    async delete(id: string): Promise<VenueAmenity> {
        return this.prisma.venueAmenity.delete({ where: { id } });
    }
}

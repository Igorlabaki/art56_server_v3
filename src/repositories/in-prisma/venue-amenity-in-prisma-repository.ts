import { PrismaClient, VenueAmenity } from "@prisma/client";
import {
    CreateVenueAmenityData,
    UpdateVenueAmenityData,
    VenueAmenityRepositoryInterface,
} from "../interface/venue-amenity-repository-interface";

export class PrismaVenueAmenityRepository implements VenueAmenityRepositoryInterface {
    constructor(private readonly prisma: PrismaClient) {}

    async create(params: CreateVenueAmenityData): Promise<VenueAmenity> {
        return this.prisma.venueAmenity.create({
            data: {
                venueId: params.venueId,
                name: params.name,
                position: params.position,
                description: params.description,
                imageUrl: params.imageUrl,
                videoUrl: params.videoUrl,
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

    async update(params: UpdateVenueAmenityData): Promise<VenueAmenity> {
        return this.prisma.venueAmenity.update({
            where: { id: params.amenityId },
            data: {
                name: params.name,
                position: params.position,
                description: params.description,
                imageUrl: params.imageUrl,
                videoUrl: params.videoUrl,
            },
        });
    }

    async delete(id: string): Promise<VenueAmenity> {
        return this.prisma.venueAmenity.delete({ where: { id } });
    }
}

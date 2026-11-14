import { PrismaClient, VenueAmenity } from "@prisma/client";
import {
    CreateVenueAmenityData,
    UpdateVenueAmenityData,
    VenueAmenityImageInput,
    VenueAmenityRepositoryInterface,
    VenueAmenityWithImages,
} from "../interface/venue-amenity-repository-interface";

const withImages = {
    images: { orderBy: [{ position: "asc" as const }, { createdAt: "asc" as const }] },
};

export class PrismaVenueAmenityRepository implements VenueAmenityRepositoryInterface {
    constructor(private readonly prisma: PrismaClient) {}

    async create(params: CreateVenueAmenityData, imageUrls: string[]): Promise<VenueAmenityWithImages> {
        return this.prisma.venueAmenity.create({
            data: {
                venueId: params.venueId,
                name: params.name,
                position: params.position,
                description: params.description,
                videoUrl: params.videoUrl,
                images: {
                    create: imageUrls.map((imageUrl, position) => ({ imageUrl, position })),
                },
            },
            include: withImages,
        });
    }

    async listByVenue(venueId: string): Promise<VenueAmenityWithImages[]> {
        return this.prisma.venueAmenity.findMany({
            where: { venueId },
            orderBy: [{ position: "asc" }, { createdAt: "asc" }],
            include: withImages,
        });
    }

    async getById(id: string): Promise<VenueAmenityWithImages | null> {
        return this.prisma.venueAmenity.findFirst({ where: { id }, include: withImages });
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

    async update(params: UpdateVenueAmenityData, images?: VenueAmenityImageInput[]): Promise<VenueAmenityWithImages> {
        return this.prisma.$transaction(async (tx) => {
            await tx.venueAmenity.update({
                where: { id: params.amenityId },
                data: {
                    name: params.name,
                    position: params.position,
                    description: params.description,
                    videoUrl: params.videoUrl,
                },
            });
            if (images) {
                const keptIds = images.flatMap((image) => (image.id ? [image.id] : []));
                await tx.venueAmenityImage.deleteMany({
                    where: { amenityId: params.amenityId, id: { notIn: keptIds } },
                });
                for (const [position, image] of images.entries()) {
                    if (image.id) {
                        await tx.venueAmenityImage.update({ where: { id: image.id }, data: { position } });
                    } else {
                        await tx.venueAmenityImage.create({
                            data: { amenityId: params.amenityId, imageUrl: image.imageUrl, position },
                        });
                    }
                }
            }
            return tx.venueAmenity.findUniqueOrThrow({ where: { id: params.amenityId }, include: withImages });
        });
    }

    async delete(id: string): Promise<VenueAmenity> {
        const [, deleted] = await this.prisma.$transaction([
            this.prisma.venueAmenityImage.deleteMany({ where: { amenityId: id } }),
            this.prisma.venueAmenity.delete({ where: { id } }),
        ]);
        return deleted;
    }
}

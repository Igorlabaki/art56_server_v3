import { PrismaClient } from "@prisma/client";
import {
    CreateVenuePhotoData,
    VenuePhotoRepositoryInterface,
    VenuePhotoUsage,
} from "../interface/venue-photo-repository-interface";

function named(id: string, name: string | null | undefined, fallback: string): VenuePhotoUsage {
    const trimmed = name?.trim();
    return { id, name: trimmed ? trimmed : fallback };
}

export class PrismaVenuePhotoRepository implements VenuePhotoRepositoryInterface {
    constructor(private readonly prisma: PrismaClient) {}

    create(data: CreateVenuePhotoData) {
        return this.prisma.venuePhoto.create({
            data: {
                venueId: data.venueId,
                url: data.url,
                storageKey: data.storageKey,
                width: data.width,
                height: data.height,
                sizeBytes: data.sizeBytes,
                description: data.description ?? null,
            },
        });
    }

    listByVenue(venueId: string) {
        return this.prisma.venuePhoto.findMany({
            where: { venueId },
            orderBy: { createdAt: "desc" },
        });
    }

    getById(id: string) {
        return this.prisma.venuePhoto.findUnique({ where: { id } });
    }

    updateDescription(id: string, description: string | null) {
        return this.prisma.venuePhoto.update({
            where: { id },
            data: { description },
        });
    }

    async delete(id: string) {
        await this.prisma.venuePhoto.delete({ where: { id } });
    }

    async listUsages(photoId: string) {
        const [siteImages, services, amenityImages, emailConfigs] = await Promise.all([
            this.prisma.image.findMany({
                where: { photoId },
                select: { id: true, description: true, tag: true },
            }),
            this.prisma.service.findMany({
                where: { photoId },
                select: { id: true, name: true },
            }),
            this.prisma.venueAmenityImage.findMany({
                where: { photoId },
                select: { id: true, amenity: { select: { name: true } } },
            }),
            this.prisma.emailConfig.findMany({
                where: { backgroundPhotoId: photoId },
                select: { id: true, title: true, type: true },
            }),
        ]);

        return {
            siteImages: siteImages.map((item) => named(item.id, item.description ?? item.tag, "Imagem do site")),
            services: services.map((item) => named(item.id, item.name, "Servico")),
            amenities: amenityImages.map((item) => named(item.id, item.amenity.name, "Caracteristica")),
            emailConfigs: emailConfigs.map((item) => named(item.id, item.title ?? item.type, "E-mail")),
        };
    }
}

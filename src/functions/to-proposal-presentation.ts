import { ProposalImageCatalogItem, ProposalPresentation, ProposalPresentationRecord } from "../repositories/interface/proposal-repository-interface";

export function toProposalPresentation(
    row: Omit<ProposalPresentationRecord, "venueId"> & { venueId?: string },
    canReorder = false,
    catalog: ProposalImageCatalogItem[] = []
): ProposalPresentation {
    return {
        name: row.name,
        description: row.description,
        logoUrl: row.logoUrl,
        city: row.city,
        state: row.state,
        neighborhood: row.neighborhood,
        street: row.street,
        streetNumber: row.streetNumber,
        maxGuest: row.maxGuest,
        hasOvernightStay: row.hasOvernightStay,
        checkIn: row.checkIn,
        checkOut: row.checkOut,
        minimumNights: row.minimumNights,
        openingHour: row.openingHour,
        closingHour: row.closingHour,
        url: row.url,
        instagramUrl: row.instagramUrl,
        facebookUrl: row.facebookUrl,
        tiktokUrl: row.tiktokUrl,
        tourVideoUrl: row.tourVideoUrl,
        whatsappNumber: row.whatsappNumber,
        proposalPrimaryColor: row.proposalPrimaryColor,
        proposalSecondaryColor: row.proposalSecondaryColor,
        proposalTextColor: row.proposalTextColor,
        canReorder,
        catalog: canReorder ? catalog : [],
        images: row.images.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            description: image.description,
            position: image.position,
        })),
        amenities: row.amenities.map((amenity) => ({
            name: amenity.name,
            position: amenity.position,
            description: amenity.description,
            images: [...amenity.images],
            imageUrl: amenity.images[0] ?? null,
            videoUrl: amenity.videoUrl,
        })),
    };
}

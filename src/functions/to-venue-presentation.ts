import { resolvedPublicVenueLinks, VenueLinkRow } from "./venue-link";

export type VenuePresentationPricingModel =
    | "PER_PERSON"
    | "PER_DAY"
    | "PER_PERSON_DAY"
    | "PER_PERSON_HOUR"
    | "TIERED";

export type VenuePublicPresentationSource = {
    id: string;
    name: string;
    description: string | null;
    slogan: string | null;
    logoUrl: string | null;
    faviconUrl: string | null;
    proposalPrimaryColor: string | null;
    proposalSecondaryColor: string | null;
    proposalTextColor: string | null;
    url: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
    tiktokUrl: string | null;
    tourVideoUrl: string | null;
    whatsappNumber: string | null;
    email?: string | null;
    organizationUrl?: string | null;
    links?: VenueLinkRow[];
    neighborhood: string;
    city: string;
    state: string;
    street: string;
    streetNumber: string;
    maxGuest: number;
    hasOvernightStay: boolean;
    checkIn: string | null;
    checkOut: string | null;
    minimumNights: number | null;
    openingHour: string | null;
    closingHour: string | null;
    pricingModel: VenuePresentationPricingModel;
    pricePerPerson: number | null;
    pricePerDay: number | null;
    pricePerPersonDay: number | null;
    pricePerPersonHour: number | null;
    minimumPrice: number | null;
    images: {
        id: string;
        imageUrl: string;
        description: string | null;
        position: number;
        isShowOnProposal: boolean | null;
    }[];
    amenities: {
        name: string;
        position: number;
        description: string | null;
        images: string[];
        imageUrl: string | null;
        videoUrl: string | null;
    }[];
    services: {
        id: string;
        name: string;
        description: string | null;
        imageUrl: string | null;
        price?: number;
        pricingType?: string;
        rpaRequired?: boolean;
        rpaMinPeople?: number | null;
    }[];
};

const PRICE_BY_MODEL: Record<
    Exclude<VenuePresentationPricingModel, "TIERED">,
    keyof Pick<
        VenuePublicPresentationSource,
        "pricePerPerson" | "pricePerDay" | "pricePerPersonDay" | "pricePerPersonHour"
    >
> = {
    PER_PERSON: "pricePerPerson",
    PER_DAY: "pricePerDay",
    PER_PERSON_DAY: "pricePerPersonDay",
    PER_PERSON_HOUR: "pricePerPersonHour",
};

export function toVenuePresentation(source: VenuePublicPresentationSource) {
    const minimumPrice = source.minimumPrice && source.minimumPrice > 0 ? source.minimumPrice : null;
    const amount = source.pricingModel === "TIERED" ? null : source[PRICE_BY_MODEL[source.pricingModel]];
    const images = source.images
        .filter((image) => image.isShowOnProposal === true)
        .slice()
        .sort((left, right) => left.position - right.position || left.id.localeCompare(right.id))
        .map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            description: image.description,
            position: image.position,
        }));
    const services = source.services
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"))
        .map((service) => ({
            id: service.id,
            name: service.name,
            description: service.description,
            imageUrl: service.imageUrl,
        }));

    return {
        name: source.name,
        description: source.description,
        slogan: source.slogan,
        logoUrl: source.logoUrl,
        faviconUrl: source.faviconUrl,
        proposalPrimaryColor: source.proposalPrimaryColor,
        proposalSecondaryColor: source.proposalSecondaryColor,
        proposalTextColor: source.proposalTextColor,
        url: source.url,
        instagramUrl: source.instagramUrl,
        facebookUrl: source.facebookUrl,
        tiktokUrl: source.tiktokUrl,
        tourVideoUrl: source.tourVideoUrl,
        whatsappNumber: source.whatsappNumber,
        links: resolvedPublicVenueLinks(source.name, source.links ?? [], source),
        neighborhood: source.neighborhood,
        city: source.city,
        state: source.state,
        street: source.street,
        streetNumber: source.streetNumber,
        maxGuest: source.maxGuest,
        hasOvernightStay: source.hasOvernightStay,
        checkIn: source.checkIn,
        checkOut: source.checkOut,
        minimumNights: source.minimumNights,
        openingHour: source.openingHour,
        closingHour: source.closingHour,
        images,
        amenities: source.amenities
            .slice()
            .sort((left, right) => left.position - right.position || left.name.localeCompare(right.name, "pt-BR"))
            .map((amenity) => ({
                name: amenity.name,
                position: amenity.position,
                description: amenity.description,
                images: amenity.images,
                imageUrl: amenity.imageUrl,
                videoUrl: amenity.videoUrl,
            })),
        services,
        pricing: {
            model: source.pricingModel,
            amount,
            minimumPrice,
        },
    };
}

import { VenueLinkKind, VenueLinkRow } from "../../functions/venue-link";

export type VenueLinkRecord = {
    id: string;
    name: string;
    logoUrl: string | null;
    slogan: string | null;
    proposalPrimaryColor: string | null;
    proposalSecondaryColor: string | null;
    proposalTextColor: string | null;
    url: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
    tiktokUrl: string | null;
    whatsappNumber: string | null;
    email: string | null;
    tourVideoUrl: string | null;
    street: string;
    streetNumber: string;
    neighborhood: string;
    city: string;
    state: string;
    organizationUrl: string | null;
    links: VenueLinkRow[];
};

export interface VenueLinkRepository {
    findByKey(key: string): Promise<VenueLinkRecord | null>;
    replace(venueId: string, rows: VenueLinkRow[]): Promise<void>;
    insertMissing(venueId: string, rows: VenueLinkRow[]): Promise<void>;
    deleteKinds(venueId: string, kinds: VenueLinkKind[]): Promise<void>;
}

export interface VenueInfoEditPermission {
    canEditVenueInfo(userId: string, venueId: string): Promise<boolean>;
}

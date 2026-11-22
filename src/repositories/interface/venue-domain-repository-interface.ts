import { VenueDomainChallenge } from "../../use-cases/venue/venue-domain/venue-domain-registrar";

export type VenueDomainStatus = "PENDING" | "ACTIVE" | "REMOVED";

export type VenueDomainRecord = {
    id: string;
    venueId: string;
    hostname: string;
    status: VenueDomainStatus;
    verificationType: string | null;
    verificationName: string | null;
    verificationValue: string | null;
};

export type VenueDomainVenue = {
    id: string;
    name: string;
};

export interface VenueDomainRepository {
    findVenue(key: string): Promise<VenueDomainVenue | null>;
    listByVenue(venueId: string): Promise<VenueDomainRecord[]>;
    findByHostname(hostname: string): Promise<VenueDomainRecord | null>;
    findActiveByHostname(hostname: string): Promise<{ venueId: string; name: string } | null>;
    savePending(venueId: string, hostname: string, challenge: VenueDomainChallenge | null): Promise<VenueDomainRecord>;
    markActive(id: string): Promise<VenueDomainRecord>;
    markRemoved(id: string): Promise<void>;
}

export interface VenueDomainReadPermission {
    canReadVenueDomain(userId: string, venueId: string): Promise<boolean>;
}

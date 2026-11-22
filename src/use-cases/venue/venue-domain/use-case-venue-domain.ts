import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { HttpForbiddenError } from "../../../errors/errors-type/http-forbidden-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { logDomainEvent } from "../../../functions/domain-log";
import { hostnameFromRequestHost, normalizeVenueHostname } from "../../../functions/venue-domain-hostname";
import { VenueInfoEditPermission } from "../../../repositories/interface/venue-link-repository-interface";
import {
    VenueDomainReadPermission,
    VenueDomainRecord,
    VenueDomainRepository,
} from "../../../repositories/interface/venue-domain-repository-interface";
import { VenueDomainAttachError, VenueDomainRegistrar } from "./venue-domain-registrar";

const denyEdit: VenueInfoEditPermission = { canEditVenueInfo: async () => false };
const denyRead: VenueDomainReadPermission = { canReadVenueDomain: async () => false };

export type VenueDomainView = {
    hostname: string | null;
    status: "PENDING" | "ACTIVE" | "REMOVED" | null;
    verification: { type: string; name: string; value: string } | null;
};

function viewOf(rows: VenueDomainRecord[]): VenueDomainView {
    const pending = rows.find((row) => row.status === "PENDING");
    const active = rows.find((row) => row.status === "ACTIVE");
    const current = pending ?? active ?? null;
    if (!current) return { hostname: null, status: null, verification: null };
    const verification = current.verificationType && current.verificationName && current.verificationValue
        ? { type: current.verificationType, name: current.verificationName, value: current.verificationValue }
        : null;
    return { hostname: current.hostname, status: current.status, verification };
}

function envelope(data: VenueDomainView) {
    return {
        success: true as const,
        message: "Dominio do espaco",
        data,
        type: "VenueDomain",
    };
}

class GetVenueDomainUseCase {
    constructor(
        private readonly domains: VenueDomainRepository,
        private readonly permission: VenueDomainReadPermission = denyRead,
    ) {}

    async execute(userId: string, venueKey: string) {
        const venue = await this.domains.findVenue(venueKey);
        if (!venue) throw new HttpResourceNotFoundError("Espaco");
        if (!(await this.permission.canReadVenueDomain(userId, venue.id))) {
            throw new HttpForbiddenError("Sem permissao para ver o dominio deste espaco");
        }
        return envelope(viewOf(await this.domains.listByVenue(venue.id)));
    }
}

class SaveVenueDomainUseCase {
    constructor(
        private readonly domains: VenueDomainRepository,
        private readonly permission: VenueInfoEditPermission = denyEdit,
        private readonly registrar: VenueDomainRegistrar,
    ) {}

    async execute(userId: string, venueKey: string, rawHostname: string) {
        const venue = await this.domains.findVenue(venueKey);
        if (!venue) throw new HttpResourceNotFoundError("Espaco");
        if (!(await this.permission.canEditVenueInfo(userId, venue.id))) {
            throw new HttpForbiddenError("Sem permissao para editar o espaco");
        }
        const normalized = normalizeVenueHostname(rawHostname);
        if (!normalized.ok) throw new HttpBadRequestError("Hostname invalido.");
        const taken = await this.domains.findByHostname(normalized.hostname);
        if (taken && taken.venueId !== venue.id) throw new HttpConflictError("Dominio");
        const current = await this.domains.listByVenue(venue.id);
        const same = current.find((row) => (
            row.hostname === normalized.hostname && (row.status === "PENDING" || row.status === "ACTIVE")
        ));
        if (same) return envelope(viewOf(current));
        let challenge = null;
        try {
            challenge = await this.registrar.add(normalized.hostname);
        } catch (error) {
            if (error instanceof VenueDomainAttachError && error.status === 409) {
                throw new HttpConflictError("Dominio");
            }
            throw error;
        }
        await this.domains.savePending(venue.id, normalized.hostname, challenge);
        return envelope(viewOf(await this.domains.listByVenue(venue.id)));
    }
}

class VerifyVenueDomainUseCase {
    constructor(
        private readonly domains: VenueDomainRepository,
        private readonly permission: VenueInfoEditPermission = denyEdit,
        private readonly registrar: VenueDomainRegistrar,
    ) {}

    async execute(userId: string, venueKey: string) {
        const venue = await this.domains.findVenue(venueKey);
        if (!venue) throw new HttpResourceNotFoundError("Espaco");
        if (!(await this.permission.canEditVenueInfo(userId, venue.id))) {
            throw new HttpForbiddenError("Sem permissao para editar o espaco");
        }
        const current = await this.domains.listByVenue(venue.id);
        const pending = current.find((row) => row.status === "PENDING");
        if (!pending) return envelope(viewOf(current));
        const verified = await this.registrar.verify(pending.hostname);
        if (!verified) return envelope(viewOf(current));
        const active = current.find((row) => row.status === "ACTIVE");
        if (active) {
            await this.registrar.remove(active.hostname);
            await this.domains.markRemoved(active.id);
        }
        await this.domains.markActive(pending.id);
        return envelope(viewOf(await this.domains.listByVenue(venue.id)));
    }
}

class DeleteVenueDomainUseCase {
    constructor(
        private readonly domains: VenueDomainRepository,
        private readonly permission: VenueInfoEditPermission = denyEdit,
        private readonly registrar: VenueDomainRegistrar,
    ) {}

    async execute(userId: string, venueKey: string) {
        const venue = await this.domains.findVenue(venueKey);
        if (!venue) throw new HttpResourceNotFoundError("Espaco");
        if (!(await this.permission.canEditVenueInfo(userId, venue.id))) {
            throw new HttpForbiddenError("Sem permissao para editar o espaco");
        }
        const current = await this.domains.listByVenue(venue.id);
        const target = current.find((row) => row.status === "ACTIVE") ?? current.find((row) => row.status === "PENDING");
        if (!target) return envelope(viewOf(current));
        await this.registrar.remove(target.hostname);
        await this.domains.markRemoved(target.id);
        return envelope(viewOf(await this.domains.listByVenue(venue.id)));
    }
}

class ResolveVenueDomainUseCase {
    constructor(private readonly domains: VenueDomainRepository) {}

    async execute(rawHost: string) {
        const hostname = hostnameFromRequestHost(rawHost);
        if (!hostname) {
            logDomainEvent("domain.resolve.miss", {});
            throw new HttpResourceNotFoundError("Dominio");
        }
        const found = await this.domains.findActiveByHostname(hostname);
        if (!found) {
            logDomainEvent("domain.resolve.miss", { hostname });
            throw new HttpResourceNotFoundError("Dominio");
        }
        return { venueId: found.venueId, name: found.name };
    }
}

export { DeleteVenueDomainUseCase, GetVenueDomainUseCase, ResolveVenueDomainUseCase, SaveVenueDomainUseCase, VerifyVenueDomainUseCase };

import { Prisma, PrismaClient } from "@prisma/client";
import { venuePublicKeyWhere } from "../../functions/venue-public-key";
import { HttpConflictError } from "../../errors/errors-type/htttp-conflict-error";
import {
    VenueDomainReadPermission,
    VenueDomainRecord,
    VenueDomainRepository,
    VenueDomainVenue,
} from "../interface/venue-domain-repository-interface";
import { VenueDomainChallenge } from "../../use-cases/venue/venue-domain/venue-domain-registrar";

function mapRow(row: {
    id: string;
    venueId: string;
    hostname: string;
    status: "PENDING" | "ACTIVE" | "REMOVED";
    verificationType: string | null;
    verificationName: string | null;
    verificationValue: string | null;
}): VenueDomainRecord {
    return {
        id: row.id,
        venueId: row.venueId,
        hostname: row.hostname,
        status: row.status,
        verificationType: row.verificationType,
        verificationName: row.verificationName,
        verificationValue: row.verificationValue,
    };
}

export class PrismaVenueDomainRepository implements VenueDomainRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findVenue(key: string): Promise<VenueDomainVenue | null> {
        return this.prisma.venue.findUnique({
            where: venuePublicKeyWhere(key),
            select: { id: true, name: true },
        });
    }

    async listByVenue(venueId: string): Promise<VenueDomainRecord[]> {
        const rows = await this.prisma.venueDomain.findMany({ where: { venueId } });
        return rows.map(mapRow);
    }

    async findByHostname(hostname: string): Promise<VenueDomainRecord | null> {
        const row = await this.prisma.venueDomain.findUnique({ where: { hostname } });
        return row ? mapRow(row) : null;
    }

    async findActiveByHostname(hostname: string): Promise<{ venueId: string; name: string } | null> {
        const row = await this.prisma.venueDomain.findUnique({
            where: { hostname },
            select: {
                status: true,
                venue: { select: { id: true, name: true } },
            },
        });
        if (!row || row.status !== "ACTIVE") return null;
        return { venueId: row.venue.id, name: row.venue.name };
    }

    async savePending(venueId: string, hostname: string, challenge: VenueDomainChallenge | null): Promise<VenueDomainRecord> {
        const data = {
            hostname,
            status: "PENDING" as const,
            verificationType: challenge?.type ?? null,
            verificationName: challenge?.name ?? null,
            verificationValue: challenge?.value ?? null,
        };
        try {
            const pending = await this.prisma.venueDomain.findFirst({
                where: { venueId, status: "PENDING" },
            });
            const saved = pending
                ? await this.prisma.venueDomain.update({ where: { id: pending.id }, data })
                : await this.prisma.venueDomain.create({ data: { venueId, ...data } });
            return mapRow(saved);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new HttpConflictError("Dominio");
            }
            throw error;
        }
    }

    async markActive(id: string): Promise<VenueDomainRecord> {
        const saved = await this.prisma.venueDomain.update({
            where: { id },
            data: { status: "ACTIVE", activatedAt: new Date() },
        });
        return mapRow(saved);
    }

    async markRemoved(id: string): Promise<void> {
        await this.prisma.venueDomain.update({
            where: { id },
            data: {
                status: "REMOVED",
                hostname: `revoked:${id}`,
                verificationType: null,
                verificationName: null,
                verificationValue: null,
            },
        });
    }
}

export class PrismaVenueDomainReadPermission implements VenueDomainReadPermission {
    constructor(private readonly prisma: PrismaClient) {}

    async canReadVenueDomain(userId: string, venueId: string): Promise<boolean> {
        const row = await this.prisma.userVenuePermission.findFirst({
            where: { venueId, userOrganization: { userId } },
            select: { id: true },
        });
        return Boolean(row);
    }
}

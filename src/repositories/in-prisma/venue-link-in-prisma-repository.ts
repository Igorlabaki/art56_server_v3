import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import { VenueLinkKind, VenueLinkRow } from "../../functions/venue-link";
import { venuePublicKeyWhere } from "../../functions/venue-public-key";
import { permissionsInclude } from "./venue-site-edit-permission-in-prisma";
import { VenueInfoEditPermission, VenueLinkRecord, VenueLinkRepository } from "../interface/venue-link-repository-interface";

const EDIT_VENUE_INFO = "EDIT_VENUE_INFO";

export class PrismaVenueLinkRepository implements VenueLinkRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findByKey(key: string): Promise<VenueLinkRecord | null> {
        const venue = await this.prisma.venue.findUnique({
            where: venuePublicKeyWhere(key),
            select: {
                id: true,
                name: true,
                logoUrl: true,
                slogan: true,
                proposalPrimaryColor: true,
                proposalSecondaryColor: true,
                proposalTextColor: true,
                url: true,
                instagramUrl: true,
                facebookUrl: true,
                tiktokUrl: true,
                whatsappNumber: true,
                email: true,
                tourVideoUrl: true,
                street: true,
                streetNumber: true,
                neighborhood: true,
                city: true,
                state: true,
                organization: { select: { url: true } },
                links: {
                    select: { kind: true, url: true, visible: true, position: true },
                    orderBy: { position: "asc" },
                },
            },
        });
        if (!venue) return null;
        const { organization, links, ...rest } = venue;
        return {
            ...rest,
            organizationUrl: organization.url,
            links: links.map((link) => ({
                kind: link.kind,
                url: link.url,
                visible: link.visible,
                position: link.position,
            })),
        };
    }

    async replace(venueId: string, rows: VenueLinkRow[]) {
        await this.prisma.$transaction([
            this.prisma.venueLink.deleteMany({ where: { venueId } }),
            this.prisma.venueLink.createMany({
                data: rows.map((row) => ({
                    id: randomUUID(),
                    venueId,
                    kind: row.kind as VenueLinkKind,
                    url: row.url,
                    visible: row.visible,
                    position: row.position,
                })),
            }),
        ]);
    }

    async insertMissing(venueId: string, rows: VenueLinkRow[]) {
        if (rows.length === 0) return;
        await this.prisma.venueLink.createMany({
            data: rows.map((row) => ({
                id: randomUUID(),
                venueId,
                kind: row.kind as VenueLinkKind,
                url: row.url,
                visible: row.visible,
                position: row.position,
            })),
            skipDuplicates: true,
        });
    }

    async deleteKinds(venueId: string, kinds: VenueLinkKind[]) {
        if (kinds.length === 0) return;
        await this.prisma.venueLink.deleteMany({ where: { venueId, kind: { in: kinds } } });
    }
}

export class PrismaVenueInfoEditPermission implements VenueInfoEditPermission {
    constructor(private readonly prisma: PrismaClient) {}

    async canEditVenueInfo(userId: string, venueId: string) {
        const rows = await this.prisma.userVenuePermission.findMany({
            where: { venueId, userOrganization: { userId } },
            select: { permissions: true },
        });
        return rows.some((row) => permissionsInclude(row.permissions, EDIT_VENUE_INFO));
    }
}

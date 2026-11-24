import { PrismaClient } from "@prisma/client";
import { permissionsInclude } from "./venue-site-edit-permission-in-prisma";

export const VIEW_VENUE_SITES = "VIEW_VENUE_SITES";

export interface VenueSiteViewPermission {
    canViewVenueSites(userId: string, venueId: string): Promise<boolean>;
}

export class PrismaVenueSiteViewPermission implements VenueSiteViewPermission {
    constructor(private readonly prisma: PrismaClient) {}

    async canViewVenueSites(userId: string, venueId: string) {
        const rows = await this.prisma.userVenuePermission.findMany({
            where: {
                venueId,
                userOrganization: { userId },
            },
            select: { permissions: true },
        });
        return rows.some((row) => permissionsInclude(row.permissions, VIEW_VENUE_SITES));
    }
}

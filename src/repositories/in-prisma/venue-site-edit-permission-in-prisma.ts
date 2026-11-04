import { PrismaClient } from "@prisma/client";
import { VenueSiteEditPermission } from "../interface/venue-site-edit-permission-interface";

export const EDIT_VENUE_SITE = "EDIT_VENUE_SITE";

export function permissionsInclude(permissions: string, permission: string) {
    return permissions.split(",").map((item) => item.trim()).includes(permission);
}

export class PrismaVenueSiteEditPermission implements VenueSiteEditPermission {
    constructor(private readonly prisma: PrismaClient) {}

    async canEditVenueSite(userId: string, venueId: string): Promise<boolean> {
        const rows = await this.prisma.userVenuePermission.findMany({
            where: {
                venueId,
                userOrganization: { userId },
            },
            select: { permissions: true },
        });

        return rows.some((row) => permissionsInclude(row.permissions, EDIT_VENUE_SITE));
    }
}

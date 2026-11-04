export interface VenueSiteEditPermission {
    canEditVenueSite: (userId: string, venueId: string) => Promise<boolean>;
}

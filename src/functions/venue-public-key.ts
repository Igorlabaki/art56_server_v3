const VENUE_ID_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isVenueIdKey(key: string) {
    return VENUE_ID_KEY.test(key);
}

export function venuePublicKeyWhere(key: string): { id: string } | { name: string } {
    return isVenueIdKey(key) ? { id: key } : { name: key };
}

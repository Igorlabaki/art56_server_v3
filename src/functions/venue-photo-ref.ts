import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";

export const VENUE_PHOTO_OTHER_VENUE_MESSAGE = "A foto nao pertence a este espaco";

export type VenuePhotoRef = { id: string; venueId: string; url: string };

export function assertPhotoBelongsToVenue(photo: VenuePhotoRef | null | undefined, venueId: string) {
    if (!photo || photo.venueId !== venueId) {
        throw new HttpBadRequestError(VENUE_PHOTO_OTHER_VENUE_MESSAGE);
    }
    return photo;
}

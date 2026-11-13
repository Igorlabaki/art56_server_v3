import { HttpBadRequestError } from "../errors/errors-type/htttp-bad-request-error";
import { deleteServiceImage, uploadServiceImage } from "./service-image-storage";
import { AMENITY_IMAGE_TYPE_MESSAGE, AmenityImageStorage } from "./venue-amenity-image";

export const amenityImageStorage: AmenityImageStorage = {
    upload: async (file) => {
        try {
            return await uploadServiceImage(file);
        } catch (error) {
            if (error instanceof HttpBadRequestError) {
                throw new HttpBadRequestError(AMENITY_IMAGE_TYPE_MESSAGE);
            }
            throw error;
        }
    },
    remove: deleteServiceImage,
};

import { Router } from "express";
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { AuthenticatedRequest } from "../types/authenticated-request";
import { createVenueAmenityFactory } from "../use-cases/venue-amenity/create-venue-amenity/factory-create-venue-amenity";
import { deleteVenueAmenityFactory } from "../use-cases/venue-amenity/delete-venue-amenity/factory-delete-venue-amenity";
import { listVenueAmenityFactory } from "../use-cases/venue-amenity/list-venue-amenity/factory-list-venue-amenity";
import { updateVenueAmenityFactory } from "../use-cases/venue-amenity/update-venue-amenity/factory-update-venue-amenity";

const venueAmenityRoutes = Router();

venueAmenityRoutes.use(ensureAuthenticate);

venueAmenityRoutes.post("/create", async (req, res) => {
    const controller = createVenueAmenityFactory();
    await controller.handle(req as unknown as AuthenticatedRequest, res);
});

venueAmenityRoutes.get("/list/:venueId", async (req, res) => {
    const controller = listVenueAmenityFactory();
    await controller.handle(req as unknown as AuthenticatedRequest, res);
});

venueAmenityRoutes.put("/update", async (req, res) => {
    const controller = updateVenueAmenityFactory();
    await controller.handle(req as unknown as AuthenticatedRequest, res);
});

venueAmenityRoutes.delete("/delete/:amenityId", async (req, res) => {
    const controller = deleteVenueAmenityFactory();
    await controller.handle(req as unknown as AuthenticatedRequest, res);
});

export { venueAmenityRoutes };

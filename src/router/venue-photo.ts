import { Router } from "express";
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { receiveVenuePhotos } from "../functions/venue-photo-image";
import { AuthenticatedRequest } from "../types/authenticated-request";
import { venuePhotoFactory } from "../use-cases/venue-photo/factory-venue-photo";

const venuePhotoRoutes = Router();

venuePhotoRoutes.use(ensureAuthenticate);

venuePhotoRoutes.get("/list", async (req, res) => {
    await venuePhotoFactory().list(req as unknown as AuthenticatedRequest, res);
});

venuePhotoRoutes.post("/upload", receiveVenuePhotos, async (req, res) => {
    await venuePhotoFactory().upload(req as unknown as AuthenticatedRequest, res);
});

venuePhotoRoutes.put("/:id", async (req, res) => {
    await venuePhotoFactory().update(req as unknown as AuthenticatedRequest, res);
});

venuePhotoRoutes.get("/:id/usages", async (req, res) => {
    await venuePhotoFactory().usages(req as unknown as AuthenticatedRequest, res);
});

venuePhotoRoutes.delete("/:id", async (req, res) => {
    await venuePhotoFactory().delete(req as unknown as AuthenticatedRequest, res);
});

export { venuePhotoRoutes };

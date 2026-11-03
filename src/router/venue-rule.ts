import { Router } from "express";
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { AuthenticatedRequest } from "../types/authenticated-request";
import { createVenueRuleFactory } from "../use-cases/venue-rule/create-venue-rule/factory-create-venue-rule";
import { deleteVenueRuleFactory } from "../use-cases/venue-rule/delete-venue-rule/factory-delete-venue-rule";
import { listVenueRuleFactory } from "../use-cases/venue-rule/list-venue-rule/factory-list-venue-rule";
import { updateVenueRuleFactory } from "../use-cases/venue-rule/update-venue-rule/factory-update-venue-rule";

const venueRuleRoutes = Router();

venueRuleRoutes.use(ensureAuthenticate);

venueRuleRoutes.post("/create", async (req, res) => {
    const controller = createVenueRuleFactory();
    await controller.handle(req as unknown as AuthenticatedRequest, res);
});

venueRuleRoutes.get("/list/:venueId", async (req, res) => {
    const controller = listVenueRuleFactory();
    await controller.handle(req as unknown as AuthenticatedRequest, res);
});

venueRuleRoutes.put("/update", async (req, res) => {
    const controller = updateVenueRuleFactory();
    await controller.handle(req as unknown as AuthenticatedRequest, res);
});

venueRuleRoutes.delete("/delete/:ruleId", async (req, res) => {
    const controller = deleteVenueRuleFactory();
    await controller.handle(req as unknown as AuthenticatedRequest, res);
});

export { venueRuleRoutes };

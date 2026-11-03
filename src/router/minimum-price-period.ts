import { Router } from "express";
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { createMinimumPricePeriodFactory } from "../use-cases/minimum-price-period/create-minimum-price-period/factory-create-minimum-price-period";
import { deleteMinimumPricePeriodFactory } from "../use-cases/minimum-price-period/delete-minimum-price-period/factory-delete-minimum-price-period";
import { listMinimumPricePeriodFactory } from "../use-cases/minimum-price-period/list-minimum-price-period/factory-list-minimum-price-period";
import { updateMinimumPricePeriodFactory } from "../use-cases/minimum-price-period/update-minimum-price-period/factory-update-minimum-price-period";
import { AuthenticatedRequest } from "../types/authenticated-request";

const minimumPricePeriodRoutes = Router();

minimumPricePeriodRoutes.use(ensureAuthenticate);

minimumPricePeriodRoutes.post("/create", async (req, res) => {
    const controller = createMinimumPricePeriodFactory();
    await controller.handle(req as unknown as AuthenticatedRequest, res);
});

minimumPricePeriodRoutes.get("/list/:venueId", async (req, res) => {
    const controller = listMinimumPricePeriodFactory();
    await controller.handle(req as unknown as AuthenticatedRequest, res);
});

minimumPricePeriodRoutes.put("/update", async (req, res) => {
    const controller = updateMinimumPricePeriodFactory();
    await controller.handle(req as unknown as AuthenticatedRequest, res);
});

minimumPricePeriodRoutes.delete("/delete/:id", async (req, res) => {
    const controller = deleteMinimumPricePeriodFactory();
    await controller.handle(req as unknown as AuthenticatedRequest, res);
});

export { minimumPricePeriodRoutes };

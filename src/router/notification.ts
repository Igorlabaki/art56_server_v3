import { Router } from "express";
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listNotificationFactory } from "../use-cases/notification/list-notification/factory-list-notification";
import { readAllNotificationsFactory } from "../use-cases/notification/read-all/factory-read-all";
import { readNotificationsByProposalFactory } from "../use-cases/notification/read-by-proposal/factory-read-by-proposal";

const notificationRoutes = Router();

notificationRoutes.get("/list/:venueId", async (req, res) => {
    const controller = listNotificationFactory();
    await controller.handle(req, res);
});

notificationRoutes.patch("/read-by-proposal/:proposalId", ensureAuthenticate, async (req, res) => {
    const controller = readNotificationsByProposalFactory();
    await controller.handle(req, res);
});

notificationRoutes.patch("/read-all/:venueId", ensureAuthenticate, async (req, res) => {
    const controller = readAllNotificationsFactory();
    await controller.handle(req, res);
});

export { notificationRoutes };

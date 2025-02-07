import { Router } from "express";
import { listNotificationFactory } from "../use-cases/notification/list-notification/factory-list-notification";

const notificationRoutes = Router();

// List
notificationRoutes.get("/list/:venueId", async (req, res) => {
    const controller = listNotificationFactory();  
    await controller.handle(req, res);       
})

export { notificationRoutes };

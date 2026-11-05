import { Router } from "express"
import multer from "multer";

import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { AuthenticatedRequest } from "../types/authenticated-request";
import { SERVICE_IMAGE_MAX_BYTES } from "../functions/service-image";

import { listServiceFactory } from "../use-cases/service/list-service/factory-list-service";
import { createServiceFactory } from "../use-cases/service/create-service/factory-create-service";
import { deleteServiceFactory } from "../use-cases/service/delete-service/factory-delete-text";
import { updateServiceFactory } from "../use-cases/service/update-service/factory-update-service";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: SERVICE_IMAGE_MAX_BYTES },
})

const serviceRoutes = Router()

// Register
serviceRoutes.post("/create", ensureAuthenticate, upload.single("file"), async (req, res) => {
    const controller = createServiceFactory();  // Cria o controlador
    await controller.handle(req as unknown as AuthenticatedRequest, res);
})

// List
serviceRoutes.get("/list/:venueId?/:name?", async (req, res) => {
    const controller = listServiceFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Delete
serviceRoutes.delete("/delete/:serviceId",ensureAuthenticate, async (req, res) => {
    const controller = deleteServiceFactory();  // Cria o controlador
    await controller.handle(req as unknown as AuthenticatedRequest, res);
})

// Update
serviceRoutes.put("/update", ensureAuthenticate, upload.single("file"), async (req, res) => {
    const controller = updateServiceFactory();  // Cria o controlador
    await controller.handle(req as unknown as AuthenticatedRequest, res);
})

export { serviceRoutes }
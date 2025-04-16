import { Router } from "express"

import { ensureAuthenticate } from "../middleware/ensureAuthenticate";

import { listServiceFactory } from "../use-cases/service/list-service/factory-list-service";
import { createServiceFactory } from "../use-cases/service/create-service/factory-create-service";
import { deleteServiceFactory } from "../use-cases/service/delete-service/factory-delete-text";
import { updateServiceFactory } from "../use-cases/service/update-service/factory-update-service";

const serviceRoutes = Router()

// Register
serviceRoutes.post("/create",ensureAuthenticate, async (req, res) => {
    const controller = createServiceFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// List
serviceRoutes.get("/list/:venueId?/:name?", async (req, res) => {
    const controller = listServiceFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Delete
serviceRoutes.delete("/delete/:serviceId",ensureAuthenticate, async (req, res) => {
    const controller = deleteServiceFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Update
serviceRoutes.put("/update",ensureAuthenticate, async (req, res) => {
    const controller = updateServiceFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { serviceRoutes }
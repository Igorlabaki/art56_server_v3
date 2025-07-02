import { Router } from "express"

import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { createOrganizationFactory } from "../use-cases/organization/create-organization/factory-create-owner";
import { listOrganizationFactory } from "../use-cases/organization/list-organization/factory-list-organization";
import { getOrganizationByidFactory } from "../use-cases/organization/get-organization-by-user-id/factory-get-organization-by-id";
import { deleteOrganizationFactory } from "../use-cases/organization/delete-organization/factory-delete-organization";
import { updateOrganizationFactory } from "../use-cases/organization/update-organization/factory-update-organization";
import { getHubDataFactory } from "../use-cases/webData/hub/factory-get-web-data";
import multer from "multer";
import { updateVenueOrganizationImageFactory } from "../use-cases/organization/update-venue-organization-images/factory-update-venue-organization-image";
import { getOrganizationWebDataFactory } from "../use-cases/webData/web-organization/factory-get-organization-web-data";

const organizationRoutes = Router()

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register
organizationRoutes.post("/create", ensureAuthenticate, upload.single("file"), async (req, res) => {
    const controller = createOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// List
organizationRoutes.get("/list?:userId?:name", ensureAuthenticate, async (req, res) => {
    const controller = listOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Get by Id
organizationRoutes.get("/getHubData?:organizationId", async (req, res) => {
    const controller = getHubDataFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})


// Get By Id
organizationRoutes.get("/getById?:organizationId?:venueName", ensureAuthenticate, async (req, res) => {
    const controller = getOrganizationByidFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Delete
organizationRoutes.delete("/delete/:organizationId", ensureAuthenticate, async (req, res) => {
    const controller = deleteOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Get by Id
organizationRoutes.get("/getOrganizationWebData/:organizationId?", async (req, res) => {
    const controller = getOrganizationWebDataFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})


// Update
organizationRoutes.put("/update", ensureAuthenticate, upload.single("file"), async (req, res) => {
    const controller = updateOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Update Venue Organization Images
organizationRoutes.put("/update-venue-organization-images", ensureAuthenticate, async (req, res) => {
    const controller = updateVenueOrganizationImageFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { organizationRoutes }
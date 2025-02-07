import { Router } from "express"

import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { createOrganizationFactory } from "../use-cases/organization/create-organization/factory-create-owner";
import { listOrganizationFactory } from "../use-cases/organization/list-organization/factory-list-organization";
import { getOrganizationByidFactory } from "../use-cases/organization/get-organization-by-user-id/factory-get-organization-by-id";
import { deleteOrganizationFactory } from "../use-cases/organization/delete-organization/factory-delete-organization";
import { updateOrganizationFactory } from "../use-cases/organization/update-organization/factory-update-organization";

const organizationRoutes = Router()

organizationRoutes.use(ensureAuthenticate)

// Register
organizationRoutes.post("/create", async (req, res) => {
    const controller = createOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// List
organizationRoutes.get("/list?:userId?:name", async (req, res) => {
    const controller = listOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Get By Id
organizationRoutes.get("/getById?:organizationId?:venueName", async (req, res) => {
    const controller = getOrganizationByidFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Delete
organizationRoutes.delete("/delete/:organizationId", async (req, res) => {
    const controller = deleteOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Update
organizationRoutes.put("/update", async (req, res) => {
    const controller = updateOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { organizationRoutes }
import { Router } from "express"

import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { deleteOwnerFactory } from "../use-cases/owner/delete-owner/factory-delete-owner";
import { listOwnerFactory } from "../use-cases/owner/list-owners/factory-list-organization";
import { updateOwnerFactory } from "../use-cases/owner/update-owner/factory-update-organization";
import { listOwnerByVenueFactory } from "../use-cases/owner/list-by-venue-owners/factory-list-by-venue-owners";
import { createOrganizationOwnerFactory } from "../use-cases/owner/create-organization-owner/factory-create-organization-owner";
import { createVenueOwnerFactory } from "../use-cases/owner/create-venue-owner/factory-create-venue-owner";

const ownerRoutes = Router()

ownerRoutes.use(ensureAuthenticate)

// Register
ownerRoutes.post("/createOrganizationOwner", async (req, res) => {
    const controller = createOrganizationOwnerFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Register
ownerRoutes.post("/createVenueOwner", async (req, res) => {
    const controller = createVenueOwnerFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// List
ownerRoutes.get("/listByOrganization/:organizationId?/:venueName?", async (req, res) => {
    const controller = listOwnerFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// List
ownerRoutes.get("/listByVenue/:organizationId?/:venueId?/:venueName?", async (req, res) => {
    const controller = listOwnerByVenueFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Update
ownerRoutes.put("/update", async (req, res) => {
    const controller = updateOwnerFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Delete
ownerRoutes.delete("/delete/:ownerId", async (req, res) => {
    const controller = deleteOwnerFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { ownerRoutes }
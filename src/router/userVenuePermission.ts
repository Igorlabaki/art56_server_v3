import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listUserVenuePermissionFactory } from "../use-cases/user-venue-permission/list-user-venue-permission/factory-list-user-venue-permission";
import { createUserVenuePermissionFactory } from "../use-cases/user-venue-permission/create-user-venue-permission/factory-create-user-venue-permission";
import { updateUserVenuePermissionFactory } from "../use-cases/user-venue-permission/update-user-venue-permission/factory-create-user-venue-permission";
import { deleteUserVenuePermissionFactory } from "../use-cases/user-venue-permission/delete-user-venue-permission/factory-delete-user-venue-permission";
import { getUserVenuePermissionFactory } from "../use-cases/user-venue-permission/get-user-venue-permission/factory-get-user-venue-permission-id";

const userVenuePermissionRoutes = Router()

userVenuePermissionRoutes.use(ensureAuthenticate)

userVenuePermissionRoutes.get("/list?:userVenuePermissionId?", async (req, res) => {
    const controller = listUserVenuePermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

userVenuePermissionRoutes.get("/get?:venueId?/:organizationId?/:userId?", async (req, res) => {
    const controller = getUserVenuePermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Register
userVenuePermissionRoutes.post("/create", async (req, res) => {
    const controller = createUserVenuePermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Register
userVenuePermissionRoutes.put("/update", async (req, res) => {
    const controller = updateUserVenuePermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

userVenuePermissionRoutes.delete("/delete/:userVenuePermissionId?", async (req, res) => {
    const controller = deleteUserVenuePermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { userVenuePermissionRoutes }
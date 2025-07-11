import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listUserPermissionFactory } from "../use-cases/user-permission/list-user-permission/factory-list-user-permission";
import { createUserPermissionFactory } from "../use-cases/user-permission/create-user-permission/factory-create-user-permission";
import { updateUserPermissionFactory } from "../use-cases/user-permission/update-user-permission/factory-create-user-permission";
import { deleteUserPermissionFactory } from "../use-cases/user-permission/delete-user-permission/factory-delete-user-permission";
import { getUserPermissionFactory } from "../use-cases/user-permission/get-user-permission/factory-get-user-permission-id";

const userpermissionRoutes = Router()

userpermissionRoutes.use(ensureAuthenticate)

userpermissionRoutes.get("/list?:userPermissionId?", async (req, res) => {
    const controller = listUserPermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

userpermissionRoutes.get("/get?:venueId?/:userOganization?", async (req, res) => {
    const controller = getUserPermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Register
userpermissionRoutes.post("/create", async (req, res) => {
    const controller = createUserPermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Register
userpermissionRoutes.put("/update", async (req, res) => {
    const controller = updateUserPermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

userpermissionRoutes.delete("/delete/:userPermissionId?", async (req, res) => {
    const controller = deleteUserPermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { userpermissionRoutes }
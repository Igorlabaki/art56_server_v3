import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listUserOrganizationPermissionFactory } from "../use-cases/user-organization-permission/list-user-organization-permission/factory-list-user-organization-permission";
import { createUserOrganizationPermissionFactory } from "../use-cases/user-organization-permission/create-user-organization-permission/factory-create-user-organization-permission";
import { updateUserOrganizationPermissionFactory } from "../use-cases/user-organization-permission/update-user-organization-permission/factory-create-user-organization-permission";
import { deleteUserOrganizationPermissionFactory } from "../use-cases/user-organization-permission/delete-user-organization-permission/factory-delete-user-organization-permission";
import { getUserOrganizationPermissionByIdFactory } from "../use-cases/user-organization-permission/get-user-organization-permission-by-id/factory-get-user-organization-permission-id";

const userOrganizationPermissionRoutes = Router()

userOrganizationPermissionRoutes.use(ensureAuthenticate)

userOrganizationPermissionRoutes.get("/list?:userOrganizationPermissionId?", async (req, res) => {
    const controller = listUserOrganizationPermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

userOrganizationPermissionRoutes.get("/byId?:organizationId?/:userId?", async (req, res) => {
    const controller = getUserOrganizationPermissionByIdFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Register
userOrganizationPermissionRoutes.post("/create", async (req, res) => {
    const controller = createUserOrganizationPermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Register
userOrganizationPermissionRoutes.put("/update", async (req, res) => {
    const controller = updateUserOrganizationPermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

userOrganizationPermissionRoutes.delete("/delete/:userOrganizationPermissionId?", async (req, res) => {
    const controller = deleteUserOrganizationPermissionFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { userOrganizationPermissionRoutes }
import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listUserOrganizationFactory } from "../use-cases/user-organization/list-user-organization/factory-list-user-organization";
import { createUserOrganizationFactory } from "../use-cases/user-organization/create-user-organization/factory-create-user-organization";
import { listUserOrganizationByOrganizationFactory } from "../use-cases/user-organization/list-user-organization-by-organization/factory-list-user-organization-by-organization";
import { getUserOrganizationByidFactory } from "../use-cases/user-organization/get-user-organization-by-user-id/factory-get-user-organization-by-id";
import { updateUserOrganizationFactory } from "../use-cases/user-organization/update-user-organization/factory-create-user-organization";
import { deleteUserOrganizationFactory } from "../use-cases/user-organization/delete-user-organization/factory-delete-user-organization";

const userorganizationRoutes = Router()

userorganizationRoutes.use(ensureAuthenticate)

userorganizationRoutes.get("/list?:userId?/:username?", async (req, res) => {
    const controller = listUserOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Register
userorganizationRoutes.post("/create", async (req, res) => {
    const controller = createUserOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Register
userorganizationRoutes.put("/update", async (req, res) => {
    const controller = updateUserOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

userorganizationRoutes.get("/byOrganizationlist/:organizationId?/:username?", async (req, res) => {
    const controller = listUserOrganizationByOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

userorganizationRoutes.get("/getById/:organizationId?", async (req, res) => {
    const controller = getUserOrganizationByidFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

userorganizationRoutes.get("/delete/:userOrganizationId?", async (req, res) => {
    const controller = deleteUserOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { userorganizationRoutes }
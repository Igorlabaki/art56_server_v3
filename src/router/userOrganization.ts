import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listUserOrganizationFactory } from "../use-cases/user-organization/list-user-organization/factory-list-user-organization";
import { createUserOrganizationFactory } from "../use-cases/user-organization/create-user-organization/factory-create-user-organization";


const userorganizationRoutes = Router()

userorganizationRoutes.use(ensureAuthenticate)

// Register
userorganizationRoutes.get("/list?:userId?/:username?", async (req, res) => {
    const controller = listUserOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Register
userorganizationRoutes.post("/create", async (req, res) => {
    const controller = createUserOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { userorganizationRoutes }
import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { updateUserFactory } from "../use-cases/user/update/factory-update-user";

const userRoutes = Router()

userRoutes.use(ensureAuthenticate)

// Register
userRoutes.put("/update", async (req, res) => {
    const controller = updateUserFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { userRoutes }
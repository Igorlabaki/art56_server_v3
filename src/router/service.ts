import { Router } from "express"

import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { createServiceFactory } from "../use-cases/service/create-service/factory-create-service";

const serviceRoutes = Router()

serviceRoutes.use(ensureAuthenticate)

// Register
serviceRoutes.post("/create", async (req, res) => {
    const controller = createServiceFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { serviceRoutes }
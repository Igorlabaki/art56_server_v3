import { Router } from "express"

import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { createOwnerFactory } from "../use-cases/owner/create-owner/factory-create-owner";

const ownerRoutes = Router()

ownerRoutes.use(ensureAuthenticate)

// Register
ownerRoutes.post("/create", async (req, res) => {
    const controller = createOwnerFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { ownerRoutes }
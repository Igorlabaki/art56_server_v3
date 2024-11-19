import { Router } from "express"
import { refreshTokenFactory } from "../use-cases/token/factory-refresh-token";

const tokenRoutes = Router()

// Register
tokenRoutes.post("/refresh", async (req, res) => {
    const controller = refreshTokenFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { tokenRoutes }
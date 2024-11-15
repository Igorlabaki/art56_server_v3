import { Router } from "express"
import { registerUserFactory } from "../use-cases/auth/registerUser/factory-register-use-case"

const authRoutes = Router()

// Register
authRoutes.post("/register", async (req, res) => {
    const controller = registerUserFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})
//


export { authRoutes }
import { Router } from "express"
import { registerUserFactory } from "../use-cases/auth/register-user/factory-register-user"
import { authenticateUserFactory } from "../use-cases/auth/authenticate-user/factory-autheticate-user";
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { updateUserPasswordFactory } from "../use-cases/user/update-password/factory-update-user-password";
import { refreshTokenFactory } from "../use-cases/token/factory-refresh-token";

const authRoutes = Router()

// Register
authRoutes.post("/register", async (req, res) => {
    const controller = registerUserFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

authRoutes.post("/authenticate", async (req, res) => {
    const controller = authenticateUserFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

authRoutes.get("/refresh", async (req, res) => {
    const controller = refreshTokenFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

authRoutes.post("/update/password",  ensureAuthenticate , async (req, res) => {
    const controller = updateUserPasswordFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})
//


export { authRoutes }
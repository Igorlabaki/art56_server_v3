import { Router } from "express"
import { refreshTokenFactory } from "../use-cases/token/factory-refresh-token";
import { CreateOrganizationUseCase } from "../use-cases/organization/create-organization/use-case-create-organization";
import { createOrganizationFactory } from "../use-cases/organization/create-organization/factory-create-owner";
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";

const organizationRoutes = Router()

organizationRoutes.use(ensureAuthenticate)

// Register
organizationRoutes.post("/create", async (req, res) => {
    const controller = createOrganizationFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { organizationRoutes }
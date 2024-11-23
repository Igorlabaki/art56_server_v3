import { Router } from "express"

import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { createProposalFactory } from "../use-cases/proposal/create-proposal/factory-create-proposal";

const proposalRoutes = Router()

proposalRoutes.use(ensureAuthenticate)

// Register
proposalRoutes.post("/create", async (req, res) => {
    const controller = createProposalFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { proposalRoutes }
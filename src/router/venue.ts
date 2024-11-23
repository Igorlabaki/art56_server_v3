import { Router } from "express"
import { createVenueFactory } from "../use-cases/venue/create-venue/factory-create-session";
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";

const venueRoutes = Router()

venueRoutes.use(ensureAuthenticate)

// Register
venueRoutes.post("/create", async (req, res) => {
    const controller = createVenueFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { venueRoutes }
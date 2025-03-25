import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listVenueFactory } from "../use-cases/venue/list-venue/factory-list-venue";
import { deleteVenueFactory } from "../use-cases/venue/delete-venue/factory-delete-venue";
import { createVenueFactory } from "../use-cases/venue/create-venue/factory-create-session";
import { getVenuebyidFactory } from "../use-cases/venue/get-by-id-venue/factory-get-by-id-venue";
import { updateVenueFactory } from "../use-cases/venue/update-venue/factory-update-venue";
import { getVenueTrafficCountFactory } from "../use-cases/venue/get-traffic-count-venue/factory-get-traffic-count-venue";
import { getVenueAnalysiByMonthFactory } from "../use-cases/venue/get-analysis-by-month-venue/factory-get-analysis-by-month-venue";
import { listPermittedVenueFactory } from "../use-cases/venue/list-permitted-venues/factory-list-permitted-venue";

const venueRoutes = Router()

venueRoutes.use(ensureAuthenticate)

// Register
venueRoutes.post("/create", async (req, res) => {
    const controller = createVenueFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})
// List
venueRoutes.get("/list?:organizationId?/:name?", async (req, res) => {
    const controller = listVenueFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

venueRoutes.get("/permittedVenueList?:organizationId?/:name?/:userId?", async (req, res) => {
    const controller = listPermittedVenueFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// List
venueRoutes.get("/trafficCount?:venueId/:year?/:approved?", async (req, res) => {
    const controller = getVenueTrafficCountFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// List
venueRoutes.get("/analysisByMonth?:venueId/:year?/:approved?", async (req, res) => {
    const controller = getVenueAnalysiByMonthFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Get by Id
venueRoutes.get("/getById?:venueId?/:userId?", async (req, res) => {
    const controller = getVenuebyidFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Update
venueRoutes.put("/update", async (req, res) => {
    const controller = updateVenueFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Delete
venueRoutes.delete("/delete/:venueId", async (req, res) => {
    const controller = deleteVenueFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { venueRoutes }
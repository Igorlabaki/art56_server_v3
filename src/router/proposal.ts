import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listProposalFactory } from "../use-cases/proposal/list-proposal/factory-list-proposal";
import { deleteProposalByidFactory } from "../use-cases/proposal/delete-proposal/factory-delete-proposal";
import { getProposalByidFactory } from "../use-cases/proposal/get-proposal-by-id/factory-get-proposal-by-id";
import { updateProposalPerPersonFactory } from "../use-cases/proposal/update-proposal-per-person/factory-update-proposal-per-person";
import { createProposalPerPersonFactory } from "../use-cases/proposal/create-proposal-per-person/factory-create-proposal-per-person";
import { updateProposalPerDayFactory } from "../use-cases/proposal/update-proposal-per-day/factory-update-proposal-per-day";
import { updateProposalPersonalInfoFactory } from "../use-cases/proposal/update-personal-info-proposal/factory-update-proposal-personal-info";
import { createProposalPerDayFactory } from "../use-cases/proposal/create-proposal-per-day/factory-create-proposal-per-person";


const proposalRoutes = Router()



// Register
proposalRoutes.post("/createPerPerson", async (req, res) => {
    const controller = createProposalPerPersonFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

proposalRoutes.post("/createPerDay", async (req, res) => {
    const controller = createProposalPerDayFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

proposalRoutes.get("/byId/:proposalId", async (req, res) => {
    const controller = getProposalByidFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

proposalRoutes.put("/updatePerPerson",ensureAuthenticate, async (req, res) => {
    const controller = updateProposalPerPersonFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
}) 

proposalRoutes.put("/updatePersonalInfo",ensureAuthenticate, async (req, res) => {
    const controller = updateProposalPersonalInfoFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
}) 

proposalRoutes.put("/updatePerDay",ensureAuthenticate, async (req, res) => {
    const controller = updateProposalPerDayFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
}) 

proposalRoutes.get("/list?:venueId?/:name?/:month?/:year?/:approved?",ensureAuthenticate, async (req, res) => {
    const controller = listProposalFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

proposalRoutes.delete("/delete/:proposalId",ensureAuthenticate, async (req, res) => {
    const controller = deleteProposalByidFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { proposalRoutes }
import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listProposalFactory } from "../use-cases/proposal/list-proposal/factory-list-proposal";
import { deleteProposalByidFactory } from "../use-cases/proposal/delete-proposal/factory-delete-proposal";
import { getProposalByidFactory } from "../use-cases/proposal/get-proposal-by-id/factory-get-proposal-by-id";
import { getProposalPresentationFactory } from "../use-cases/proposal/get-proposal-presentation/factory-get-proposal-presentation";
import { reorderProposalImagesFactory } from "../use-cases/proposal/reorder-proposal-images/factory-reorder-proposal-images";
import { chooseProposalImageFactory } from "../use-cases/proposal/choose-proposal-image/factory-choose-proposal-image";
import { recalculatePublicProposalFactory } from "../use-cases/proposal/recalculate-public-proposal/factory-recalculate-public-proposal";
import { updatePublicProposalServicesFactory } from "../use-cases/proposal/update-public-proposal-services/factory-update-public-proposal-services";
import { updateProposalPerPersonFactory } from "../use-cases/proposal/update-proposal-per-person/factory-update-proposal-per-person";
import { createProposalPerPersonFactory } from "../use-cases/proposal/create-proposal-per-person/factory-create-proposal-per-person";
import { updateProposalPerDayFactory } from "../use-cases/proposal/update-proposal-per-day/factory-update-proposal-per-day";
import { updateProposalPersonalInfoFactory } from "../use-cases/proposal/update-personal-info-proposal/factory-update-proposal-personal-info";
import { createProposalPerDayFactory } from "../use-cases/proposal/create-proposal-per-day/factory-create-proposal-per-person";
import { replaceProposalIndicationsFactory } from "../use-cases/proposal/replace-proposal-indications/factory-replace-proposal-indications";
import { listProposalIndicationsFactory } from "../use-cases/proposal/list-proposal-indications/factory-list-proposal-indications";


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
    const controller = getProposalByidFactory();
    await controller.handle(req, res);
})

// Gravacao autenticada. A leitura abaixo fica publica de proposito.
proposalRoutes.put("/indications/:proposalId", ensureAuthenticate, async (req, res) => {
    const controller = replaceProposalIndicationsFactory();
    await controller.handle(req, res);
});

proposalRoutes.get("/indications/:proposalId", async (req, res) => {
    const controller = listProposalIndicationsFactory();
    await controller.handle(req, res);
});

proposalRoutes.get("/presentation/:proposalId", async (req, res) => {
    const controller = getProposalPresentationFactory();
    await controller.handle(req, res);
})

proposalRoutes.put("/presentation/:proposalId/image-order", ensureAuthenticate, async (req, res) => {
    const controller = reorderProposalImagesFactory();
    await controller.handle(req, res);
});

proposalRoutes.put("/presentation/:proposalId/image-choice", ensureAuthenticate, async (req, res) => {
    const controller = chooseProposalImageFactory();
    await controller.handle(req, res);
});

// Publico de proposito: quem tem o link recalcula o proprio orcamento. Confirmado e corpo estreito ficam no use case.
proposalRoutes.put("/presentation/:proposalId/recalculate", async (req, res) => {
    const controller = recalculatePublicProposalFactory();
    await controller.handle(req, res);
});

// Publico de proposito: quem tem o link marca os servicos deste orcamento. Obrigatorio e corpo estreito ficam no use case.
proposalRoutes.get("/presentation/:proposalId/services", async (req, res) => {
    const controller = updatePublicProposalServicesFactory();
    await controller.list(req, res);
});

proposalRoutes.put("/presentation/:proposalId/services", async (req, res) => {
    const controller = updatePublicProposalServicesFactory();
    await controller.update(req, res);
});

proposalRoutes.put("/updatePerPerson",ensureAuthenticate, async (req, res) => {
    const controller = updateProposalPerPersonFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
}) 

proposalRoutes.put("/updatePersonalInfo", async (req, res) => {
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
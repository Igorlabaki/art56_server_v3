import { Router } from "express";
import { sendProposalEmailFactory } from "../use-cases/email/send-proposal-to-email/factory-send-proposal-to-email";
import { sendContractEmailFactory } from "../use-cases/email/send-contratct-to-email-case/factory-send-contract-to-email";

const emailRoutes = Router();

// Create


emailRoutes.post("/email/contract", async (req, res) => {
    const controller = sendContractEmailFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})
emailRoutes.post("", async (req, res) => {
    const controller = sendProposalEmailFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})
/* dd */

export { emailRoutes };

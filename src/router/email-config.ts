import { Router } from "express";
import { makeCreateEmailConfigController } from "../use-cases/email-config/create-email-config/factory-create-email-config";
import { makeUpdateEmailConfigController } from "../use-cases/email-config/update-email-config/factory-update-email-config";
import { makeDeleteEmailConfigController } from "../use-cases/email-config/delete-email-config/factory-delete-email-config";
import { makeListEmailConfigController } from "../use-cases/email-config/list-email-config/factory-list-email-config";
import multer from "multer";

const emailConfigRoutes = Router();

// Configuração do Multer (memória)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage
});

// Create
emailConfigRoutes.post("/create", upload.single("file"), async (req, res) => {
    const controller = makeCreateEmailConfigController();
    await controller.handle(req, res);
});

// List
emailConfigRoutes.get("/list/:venueId", async (req, res) => {
    const controller = makeListEmailConfigController();
    await controller.handle(req, res);
});

// Delete
emailConfigRoutes.delete("/delete/:id", async (req, res) => {
    const controller = makeDeleteEmailConfigController();
    await controller.handle(req, res);
});

// Update
emailConfigRoutes.put("/update", upload.single("file"), async (req, res) => {
    const controller = makeUpdateEmailConfigController();
    await controller.handle(req, res);
});

export { emailConfigRoutes }; 
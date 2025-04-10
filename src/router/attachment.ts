import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listAttachmentFactory } from "../use-cases/attachment/list-attachment/factory-list-attachment";
import { createAttachmentFactory } from "../use-cases/attachment/create-attachment/factory-create-attachment";
import { deleteAttachmentFactory } from "../use-cases/attachment/delete-attachment/factory-delete-attachment";
import { updateAttachmentFactory } from "../use-cases/attachment/update-attachment/factory-update-attachment";

const attachmentRoutes = Router()

attachmentRoutes.use(ensureAuthenticate)

// Register
attachmentRoutes.post("/create", async (req, res) => {
    const controller = createAttachmentFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// List
attachmentRoutes.get("/list/:venueId?/:name?", async (req, res) => {
    const controller = listAttachmentFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Delete
attachmentRoutes.delete("/delete/:attachmentId", async (req, res) => {
    const controller = deleteAttachmentFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Update
attachmentRoutes.put("/update", async (req, res) => {
    const controller = updateAttachmentFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { attachmentRoutes }
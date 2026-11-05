import { Router } from "express";
import multer from "multer";
import { SERVICE_IMAGE_MAX_BYTES } from "../functions/service-image";
import { createContactFactory } from "../use-cases/contact/create-contact/factory-create-contact";
import { deleteContactFactory } from "../use-cases/contact/delete-contact/factory-delete-contact";
import { listContactFactory } from "../use-cases/contact/list-contact/factory-list-contact";
import { updateContactFactory } from "../use-cases/contact/update-contact/factory-update-contact";


const contactRoutes = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: SERVICE_IMAGE_MAX_BYTES },
});

// Create
contactRoutes.post("/create", upload.single("file"), async (req, res) => {
    const controller = createContactFactory();  
    await controller.handle(req, res);       
})

// List
contactRoutes.get("/list/:venueId?/:name?/:type?", async (req, res) => {
    const controller = listContactFactory();  
    await controller.handle(req, res);       
})

// Delete
contactRoutes.delete("/delete/:contactId", async (req, res) => {
    const controller = deleteContactFactory();  
    await controller.handle(req, res);       
})

// Update
contactRoutes.put("/update", upload.single("file"), async (req, res) => {
    const controller = updateContactFactory();  
    await controller.handle(req, res);       
})

/* 
// Get By Id
contactRoutes.get("/getById/:contactId", getContactByIdFactory().handle);
//
// Get By Name
contactRoutes.get("/getByArea/:area", getContactByAreaFactory().handle);
//
*/

export { contactRoutes };

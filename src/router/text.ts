import { Router } from "express";
import { listTextFactory } from "../use-cases/text/list-text/factory-list-text";
import { createTextFactory } from "../use-cases/text/create-text/factory-create-text";
import { deleteTextFactory } from "../use-cases/text/delete-text/factory-delete-text";
import { updateTextFactory } from "../use-cases/text/update-text/factory-update-text";
import { createTextOrganizationFactory } from "../use-cases/text-organization/create-text-organization/factory-create-text-organization";
import { updateTextOrganizationFactory } from "../use-cases/text-organization/update-text-organization/factory-update-text-organization";

const textRoutes = Router();

// Create
textRoutes.post("/create", async (req, res) => {
    const controller = createTextFactory();  
    await controller.handle(req, res);       
})

// Create
textRoutes.post("/create-text-organization", async (req, res) => {
    const controller = createTextOrganizationFactory();  
    await controller.handle(req, res);       
})

// List
textRoutes.get("/list/:venueId?/:area?", async (req, res) => {
    const controller = listTextFactory();  
    await controller.handle(req, res);       
})

// Delete
textRoutes.delete("/delete/:textId", async (req, res) => {
    const controller = deleteTextFactory();  
    await controller.handle(req, res);       
})

// Update
textRoutes.put("/update", async (req, res) => {
    const controller = updateTextFactory();  
    await controller.handle(req, res);       
})

// Update
textRoutes.put("/update-text-organization", async (req, res) => {
    const controller = updateTextOrganizationFactory();  
    await controller.handle(req, res);       
})

/* 
// Get By Id
textRoutes.get("/getById/:textId", getTextByIdFactory().handle);
//
 
textRoutes.get("/getByArea/:area", getTextByAreaFactory().handle);

*/

export { textRoutes };

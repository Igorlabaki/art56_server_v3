import { Router } from "express";
import { listTextFactory } from "../use-cases/text/list-text/factory-list-text";
import { createTextFactory } from "../use-cases/text/create-text/factory-create-text";
import { deleteTextFactory } from "../use-cases/text/delete-text/factory-delete-text";
import { updateTextFactory } from "../use-cases/text/update-text/factory-update-text";

const textRoutes = Router();

// Create
textRoutes.post("/create", async (req, res) => {
    const controller = createTextFactory();  
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

/* 
// Get By Id
textRoutes.get("/getById/:textId", getTextByIdFactory().handle);
//
 
textRoutes.get("/getByArea/:area", getTextByAreaFactory().handle);

*/

export { textRoutes };

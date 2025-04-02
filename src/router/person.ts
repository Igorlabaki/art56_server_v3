import { Router } from "express";
import { listPersonFactory } from "../use-cases/person/list-person/factory-list-person";
import { createPersonFactory } from "../use-cases/person/create-person/factory-create-person";
import { deletePersonFactory } from "../use-cases/person/delete-person/factory-delete-person";
import { updatePersonFactory } from "../use-cases/person/update-person/factory-update-person";
import { getByIdPersonFactory } from "../use-cases/person/get-by-id-person/factory-get-by-id-person";

const personRoutes = Router();

// Create
personRoutes.post("/create", async (req, res) => {
    const controller = createPersonFactory();  
    await controller.handle(req, res);       
})

// List
personRoutes.get("/list?:proposalId?/:type?/:name?", async (req, res) => {
    const controller = listPersonFactory();  
    await controller.handle(req, res);       
})

// Delete
personRoutes.delete("/delete/:personId", async (req, res) => {
    const controller = deletePersonFactory();  
    await controller.handle(req, res);       
})

// Update
personRoutes.put("/update", async (req, res) => {
    const controller = updatePersonFactory();  
    await controller.handle(req, res);       
})

// Get By Id
personRoutes.put("/getById/:personId", async (req, res) => {
    const controller = getByIdPersonFactory();  
    await controller.handle(req, res);       
})
//



export { personRoutes };

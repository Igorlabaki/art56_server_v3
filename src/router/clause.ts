import { Router } from "express";
import { listClauseFactory } from "../use-cases/clause/list-clause/factory-list-clause";
import { createClauseFactory } from "../use-cases/clause/create-clause/factory-create-clause";
import { deleteClauseFactory } from "../use-cases/clause/delete-clause/factory-delete-clause";
import { updateClauseFactory } from "../use-cases/clause/update-clause/factory-update-clause";

const clauseRoutes = Router();

// Create
clauseRoutes.post("/create", async (req, res) => {
    const controller = createClauseFactory();  
    await controller.handle(req, res);       
})

// List
clauseRoutes.get("/list/:organizationId?/:title?", async (req, res) => {
    const controller = listClauseFactory();  
    await controller.handle(req, res);       
})

// Delete
clauseRoutes.delete("/delete/:clauseId", async (req, res) => {
    const controller = deleteClauseFactory();  
    await controller.handle(req, res);       
})

// Update
clauseRoutes.put("/update", async (req, res) => {
    const controller = updateClauseFactory();  
    await controller.handle(req, res);       
})

/* 
// Get By Id
clauseRoutes.get("/getById/:clauseId", getClauseByIdFactory().handle);
//
// Get By Name
clauseRoutes.get("/getByArea/:area", getClauseByAreaFactory().handle);
//
*/

export { clauseRoutes };

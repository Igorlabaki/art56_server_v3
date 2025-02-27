import { Router } from "express";
import { listContractFactory } from "../use-cases/contract/list-contract/factory-list-contract";
import { createContractFactory } from "../use-cases/contract/create-contract/factory-create-contract";
import { deleteContractFactory } from "../use-cases/contract/delete-contract/factory-delete-contract";
import { updateContractFactory } from "../use-cases/contract/update-contract/factory-update-contract"; 
import { getContractbyidFactory } from "../use-cases/contract/get-by-id-contract/factory-get-by-id-contract";


const contractRoutes = Router();

// Create
contractRoutes.post("/create", async (req, res) => {
    const controller = createContractFactory();  
    await controller.handle(req, res);       
})

// List
contractRoutes.get("/list/:venueId?/:name?", async (req, res) => {
    const controller = listContractFactory();  
    await controller.handle(req, res);       
})

// Delete
contractRoutes.delete("/delete/:contractId", async (req, res) => {
    const controller = deleteContractFactory();  
    await controller.handle(req, res);       
})

// Update
contractRoutes.put("/update", async (req, res) => {
    const controller = updateContractFactory();  
    await controller.handle(req, res);       
})
 
// Get By Id
// Update
contractRoutes.get("/getById/:contractId", async (req, res) => {
    const controller = getContractbyidFactory();  
    await controller.handle(req, res);       
})
 



export { contractRoutes };

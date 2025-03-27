import { Router } from "express";
import { createSeasonalFeeFactory } from "../use-cases/seasonal-fee/create-seasonal-fee/factory-create-seasonal-fee";
import { listSeasonalFeeFactory } from "../use-cases/seasonal-fee/list-seasonal-fee/factory-list-seasonal-fee";
import { deleteSeasonalFeeFactory } from "../use-cases/seasonal-fee/delete-seasonal-fee/factory-delete-seasonal-fee";
import { updateSeasonalFeeFactory } from "../use-cases/seasonal-fee/update-seasonal-fee/factory-update-seasonal-fee";


const seasonalFeeRoutes = Router();

// Create
seasonalFeeRoutes.post("/create", async (req, res) => {
    const controller = createSeasonalFeeFactory();  
    await controller.handle(req, res);       
})

// List
seasonalFeeRoutes.get("/list/:venueId?/:title?", async (req, res) => {
    const controller = listSeasonalFeeFactory();  
    await controller.handle(req, res);       
})

// Delete
seasonalFeeRoutes.delete("/delete/:seasonalFeeId", async (req, res) => {
    const controller = deleteSeasonalFeeFactory();  
    await controller.handle(req, res);       
})

// Update
seasonalFeeRoutes.put("/update", async (req, res) => {
    const controller = updateSeasonalFeeFactory();  
    await controller.handle(req, res);       
})

/* 
// Get By Id
seasonalfeeRoutes.get("/getById/:seasonalfeeId", getSeasonalFeeByIdFactory().handle);
//
// Get By Name
seasonalfeeRoutes.get("/getByArea/:area", getSeasonalFeeByAreaFactory().handle);
//
*/

export { seasonalFeeRoutes };

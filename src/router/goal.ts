import { Router } from "express";
import { listGoalFactory } from "../use-cases/goal/list-goal/factory-list-goal";
import { createGoalFactory } from "../use-cases/goal/create-goal/factory-create-goal";
import { deleteGoalFactory } from "../use-cases/goal/delete-goal/factory-delete-goal";
import { updateGoalFactory } from "../use-cases/goal/update-goal/factory-update-goal";
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";

const goalRoutes = Router();

goalRoutes.use(ensureAuthenticate)
// Create
goalRoutes.post("/create", async (req, res) => {
    const controller = createGoalFactory();  
    await controller.handle(req, res);       
})

// List
goalRoutes.get("/list/:venueId?/:minValue?", async (req, res) => {
    const controller = listGoalFactory();  
    await controller.handle(req, res);       
})

// Delete
goalRoutes.delete("/delete/:goalId", async (req, res) => {
    const controller = deleteGoalFactory();  
    await controller.handle(req, res);       
})

// Update
goalRoutes.put("/update", async (req, res) => {
    const controller = updateGoalFactory();  
    await controller.handle(req, res);       
})

/* 
// Get By Id
goalRoutes.get("/getById/:goalId", getGoalByIdFactory().handle);
//
// Get By Name
goalRoutes.get("/getByArea/:area", getGoalByAreaFactory().handle);
//
*/

export { goalRoutes };

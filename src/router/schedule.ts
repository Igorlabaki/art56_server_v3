import { Router } from "express";
import { listScheduleFactory } from "../use-cases/schedule/list-schedule/factory-list-schedule";
import { createScheduleFactory } from "../use-cases/schedule/create-schedule/factory-create-schedule";
import { deleteScheduleFactory } from "../use-cases/schedule/delete-schedule/factory-delete-schedule";
import { updateScheduleFactory } from "../use-cases/schedule/update-schedule/factory-update-schedule";
import { getByIdScheduleFactory } from "../use-cases/schedule/get-by-id-schedule/factory-get-by-id-schedule";

const scheduleRoutes = Router();

// Create
scheduleRoutes.post("/create", async (req, res) => {
    const controller = createScheduleFactory();  
    await controller.handle(req, res);       
})

// List
scheduleRoutes.get("/list?venueId:venueId?&name:name?", async (req, res) => {
    const controller = listScheduleFactory();  
    await controller.handle(req, res);       
})

// Delete
scheduleRoutes.delete("/delete/:scheduleId", async (req, res) => {
    const controller = deleteScheduleFactory();  
    await controller.handle(req, res);       
})

// Update
scheduleRoutes.put("/update", async (req, res) => {
    const controller = updateScheduleFactory();  
    await controller.handle(req, res);       
})


// Update
scheduleRoutes.get("/getById/:scheduleId", async (req, res) => {
    const controller = getByIdScheduleFactory();  
    await controller.handle(req, res);       
})

export { scheduleRoutes };

import { Router } from "express";
import { AuthenticatedRequest } from "../types/authenticated-request";
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listDateEventFactory } from "../use-cases/data-event/list-date-event/factory-list-date-event";
import { createDateFactory } from "../use-cases/data-event/create-data-event/factory-create-date-event";
import { deleteDateEventFactory } from "../use-cases/data-event/delete-data-event/factory-delete-date-event";
import { updateSameDayDateEventFactory } from "../use-cases/data-event/update-same-day-event/factory-update-same-day-date-event";
import { createOvernightDateFactory } from "../use-cases/data-event/create-overnight-data-event/factory-create-overnigth-date-event";
import { updateOverNigthDateEventFactory } from "../use-cases/data-event/update-overnigth-day-event/factory-update-overnigth-date-event";

const dateEventRoutes = Router();
dateEventRoutes.use(ensureAuthenticate);

// Create
dateEventRoutes.post("/createSameDay", async (req, res) => {
    const controller = createDateFactory();  
    await controller.handle(req as AuthenticatedRequest, res);       
})

// Create
dateEventRoutes.post("/createOvernigth", async (req, res) => {
    const controller = createOvernightDateFactory();  
    await controller.handle(req as AuthenticatedRequest, res);       
})

// Update Same Day
dateEventRoutes.post("/updateSameDay", async (req, res) => {
    const controller = updateSameDayDateEventFactory();  
    await controller.handle(req as AuthenticatedRequest, res);       
})

// Update Same Day
dateEventRoutes.post("/updateOverNight", async (req, res) => {
    const controller = updateOverNigthDateEventFactory();  
    await controller.handle(req as AuthenticatedRequest, res);       
})

// List
dateEventRoutes.get("/list/:venueId?/:proposalId?", async (req, res) => {
    const controller = listDateEventFactory();  
    await controller.handle(req, res);       
})

 // Delete
dateEventRoutes.delete("/delete/:dateEventId", async (req, res) => {
    const controller = deleteDateEventFactory();  
    await controller.handle(req as unknown as AuthenticatedRequest, res);       
})

/*
// Update
dateEventRoutes.put("/update", async (req, res) => {
    const controller = updateTextFactory();  
    await controller.handle(req, res);       
}) */

/* 
// Get By Id
dateEventRoutes.get("/getById/:textId", getTextByIdFactory().handle);
//
// Get By Name
dateEventRoutes.get("/getByArea/:area", getTextByAreaFactory().handle);
//
*/

export { dateEventRoutes };

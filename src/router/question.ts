import { Router } from "express";
import { listQuestionFactory } from "../use-cases/question/list-question/factory-list-question";
import { createQuestionFactory } from "../use-cases/question/create-question/factory-create-question";
import { deleteQuestionFactory } from "../use-cases/question/delete-question/factory-delete-question";
import { updateQuestionFactory } from "../use-cases/question/update-question/factory-update-question";

const questionRoutes = Router();

// Create
questionRoutes.post("/create", async (req, res) => {
    const controller = createQuestionFactory();  
    await controller.handle(req, res);       
})

// List
questionRoutes.get("/list/:venueId?/:question?", async (req, res) => {
    const controller = listQuestionFactory();  
    await controller.handle(req, res);       
})

// Delete
questionRoutes.delete("/delete/:questionId", async (req, res) => {
    const controller = deleteQuestionFactory();  
    await controller.handle(req, res);       
})

// Update
questionRoutes.put("/update", async (req, res) => {
    const controller = updateQuestionFactory();  
    await controller.handle(req, res);       
})

/* 
// Get By Id
questionRoutes.get("/getById/:questionId", getQuestionByIdFactory().handle);
//
// Get By Name
questionRoutes.get("/getByArea/:area", getQuestionByAreaFactory().handle);
//
*/

export { questionRoutes };

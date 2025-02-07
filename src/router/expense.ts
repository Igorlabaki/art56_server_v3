import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { listExpenseFactory } from "../use-cases/expense/list-expense/factory-list-expense";
import { createExpenseFactory } from "../use-cases/expense/create-expense/factory-create-expense";
import { deleteExpenseFactory } from "../use-cases/expense/delete-expense/factory-delete-expense";
import { updateExpenseFactory } from "../use-cases/expense/update-expense/factory-update-expense";

const expenseRoutes = Router()

expenseRoutes.use(ensureAuthenticate)

// Register
expenseRoutes.post("/create", async (req, res) => {
    const controller = createExpenseFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// List
expenseRoutes.get("/list/:venueId?/:name?", async (req, res) => {
    const controller = listExpenseFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Delete
expenseRoutes.delete("/delete/:expenseId", async (req, res) => {
    const controller = deleteExpenseFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Update
expenseRoutes.put("/update", async (req, res) => {
    const controller = updateExpenseFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

export { expenseRoutes }
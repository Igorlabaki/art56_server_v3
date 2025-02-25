import multer from "multer";
import dotenv from "dotenv";
import { Router } from "express";
import { listPaymentFactory } from "../use-cases/payment/list-payment/factory-list-payment";
import { createPaymentFactory } from "../use-cases/payment/create-payment/factory-create-payment";
import { deletePaymentFactory } from "../use-cases/payment/delete-payment/factory-delete-payment";
import { updatePaymentFactory } from "../use-cases/payment/update-payment/factory-update-payment";

const paymentRoutes = Router();

dotenv.config();

// Configuração do Multer (memória)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create
paymentRoutes.post("/create", upload.single("file"), (req, res) => {
  const controller = createPaymentFactory();
  controller.handle(req, res);
});

// List
paymentRoutes.get("/list?:venueId?/:proposalId?", async (req, res) => {
    const controller = listPaymentFactory();  
    await controller.handle(req, res);       
})

// Delete
paymentRoutes.delete("/delete/:paymentId", async (req, res) => {
    const controller = deletePaymentFactory();  
    await controller.handle(req, res);       
})

// Update
paymentRoutes.put("/update", async (req, res) => {
    const controller = updatePaymentFactory();  
    await controller.handle(req, res);       
})


export { paymentRoutes };

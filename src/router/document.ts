import dotenv from "dotenv";
import multer from "multer";
import { Router } from "express";
import { listDocumentFactory } from "../use-cases/document/list-document/factory-list-document";
import { createDocumentFactory } from "../use-cases/document/create-document/factory-create-document";
import { deleteDocumentFactory } from "../use-cases/document/delete-document/factory-delete-document";
import { updateDocumentFactory } from "../use-cases/document/update-document/factory-update-document";

const documentRoutes = Router();

dotenv.config();

// Configuração do Multer (memória)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create
// Create
documentRoutes.post("/create", upload.single("file"), (req, res) => {
  const controller = createDocumentFactory();
  controller.handle(req, res);
});

// List
documentRoutes.get("/list?:proposalId?/:title?", async (req, res) => {
    const controller = listDocumentFactory();  
    await controller.handle(req, res);       
})

// Delete
documentRoutes.delete("/delete/:documentId", async (req, res) => {
    const controller = deleteDocumentFactory();  
    await controller.handle(req, res);       
})

// Update
documentRoutes.put("/update", upload.single("file"), (req, res) => {
  const controller = updateDocumentFactory();
  controller.handle(req, res);
});

/* 
// Get By Id
documentRoutes.get("/getById/:documentId", getDocumentByIdFactory().handle);
//
// Get By Name
documentRoutes.get("/getByArea/:area", getDocumentByAreaFactory().handle);
//
*/

export { documentRoutes };

import multer from "multer";
import { Router, Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { listImageFactory } from "../use-cases/image/list-image/factory-list-image";
import { createImageFactory } from "../use-cases/image/create-image/factory-create-image";
import { deleteImageFactory } from "../use-cases/image/delete-image/factory-delete-image";
import { updateImageFactory } from "../use-cases/image/update-image/factory-update-question";

// Configuração do Multer (memória)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configuração do S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION, // Defina no .env
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const imageRoutes = Router();

// Create
imageRoutes.post("/upload", upload.single("file"), (req, res) => {
  const controller = createImageFactory();
  controller.handle(req, res);
});

// List
imageRoutes.get("/list?:venueId?/:description?", async (req, res) => {
    const controller = listImageFactory();  
    await controller.handle(req, res);       
})

// Delete
imageRoutes.delete("/delete/:imageId", async (req, res) => {
    const controller = deleteImageFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})

// Delete
imageRoutes.get("/getByTag?:venueId?/:tag?", async (req, res) => {
    const controller = deleteImageFactory();  // Cria o controlador
    await controller.handle(req, res);         // Chama o método handle de forma assíncrona
})
// update
imageRoutes.put("/update", upload.single("file"), (req, res) => {
  const controller = updateImageFactory();
  controller.handle(req, res);
});

    
export { imageRoutes };
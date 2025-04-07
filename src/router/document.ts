import multer from "multer";
import { Router } from "express";
import { listDocumentFactory } from "../use-cases/document/list-document/factory-list-document";
import { createDocumentFactory } from "../use-cases/document/create-document/factory-create-document";
import { deleteDocumentFactory } from "../use-cases/document/delete-document/factory-delete-document";
import { updateDocumentFactory } from "../use-cases/document/update-document/factory-update-document";

const documentRoutes = Router();

// Configuração do Multer com validações
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 2.5 * 1024 * 1024, // 2.5MB limite
    files: 1 // Apenas um arquivo por vez
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use PDF, JPEG, PNG, GIF ou WEBP'));
    }
  }
});

// Middleware para tratar erros do multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: 2.5MB' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Create
documentRoutes.post(
  "/create", 
  upload.single("file"), 
  handleMulterError,
  (req: any, res: any) => {
    const controller = createDocumentFactory();
    controller.handle(req, res);
  }
);

// List
documentRoutes.get("/list?:proposalId?/:title?", async (req, res) => {
  const controller = listDocumentFactory();  
  await controller.handle(req, res);       
});

// Delete
documentRoutes.delete("/delete/:documentId", async (req, res) => {
  const controller = deleteDocumentFactory();  
  await controller.handle(req, res);       
});

// Update
documentRoutes.put(
  "/update", 
  upload.single("file"), 
  handleMulterError,
  (req: any, res: any) => {
    const controller = updateDocumentFactory();
    controller.handle(req, res);
  }
);

export { documentRoutes };
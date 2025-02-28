import multer from "multer";
import dotenv from "dotenv";
import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { updateUserFactory } from "../use-cases/user/update/factory-update-user";

const userRoutes = Router()

dotenv.config();
const storage = multer.memoryStorage();
const upload = multer({ storage });

userRoutes.use(ensureAuthenticate)

// Register
userRoutes.put("/update", upload.single("file"), (req, res) => {
    const controller = updateUserFactory();
    controller.handle(req, res);
});

export { userRoutes }
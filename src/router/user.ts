import multer from "multer";
import { Router } from "express"
import { ensureAuthenticate } from "../middleware/ensureAuthenticate";
import { updateUserFactory } from "../use-cases/user/update/factory-update-user";
import { listUserFactory } from "../use-cases/user/list-user/factory-list-user";
import { deleteUserFactory } from "../use-cases/user/delete-user/factory-delete-user";
import { getByIdUserFactory } from "../use-cases/user/get-by-id/factory-get-by-id-user";
import { updateFcmTokenFactory } from "../use-cases/user/update-fcm-token/factory-update-fcm-token";
import { createNewUserFactory } from "../use-cases/user/create-new-user/factory-create-new-user-text";
import { updateUserPasswordFactory } from "../use-cases/user/update-password/factory-update-user-password";
import { getByEmailUserFactory } from "../use-cases/user/get-by-email/factory-get-by-email-user";


const userRoutes = Router()

const storage = multer.memoryStorage();
const upload = multer({ storage });

userRoutes.use(ensureAuthenticate)

// Register
userRoutes.put("/update", upload.single("file"), (req, res) => {
    const controller = updateUserFactory();
    controller.handle(req, res);
});

userRoutes.put("/updatePassword", (req, res) => {
    const controller = updateUserPasswordFactory();
    controller.handle(req, res);
});

// Register
userRoutes.post("/createNewUser", (req, res) => {
    const controller = createNewUserFactory();
    controller.handle(req, res);
});

// Register
userRoutes.get("/getById?:userId?", (req, res) => {
    const controller = getByIdUserFactory();
    controller.handle(req, res);
});

// Register
userRoutes.get("/getByEmail?:email?", (req, res) => {
    const controller = getByEmailUserFactory();
    controller.handle(req, res);
});

// Register
userRoutes.delete("/delete/:userId", (req, res) => {
    const controller = deleteUserFactory();
    controller.handle(req, res);
});

// Register
userRoutes.get("/list?:organizationId?/:email?", (req, res) => {
    const controller = listUserFactory();
    controller.handle(req, res);
});

// Update FCM Token
userRoutes.put("/fcm-token", async (req, res) => {
    const controller = updateFcmTokenFactory();
    await controller.handle(req, res);
})


export { userRoutes }
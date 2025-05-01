import cors from "cors";
import express from "express";
import { textRoutes } from "./router/text";
import { authRoutes } from "./router/auth";
import { userRoutes } from "./router/user";
import { imageRoutes } from "./router/image";
import { tokenRoutes } from "./router/token";
import { venueRoutes } from "./router/venue";
import { ownerRoutes } from "./router/owner";
import { personRoutes } from "./router/person";
import { clauseRoutes } from "./router/clause";
import { contactRoutes } from "./router/contact";
import { serviceRoutes } from "./router/service";
import { expenseRoutes } from "./router/expense";
import { paymentRoutes } from "./router/payment";
import { proposalRoutes } from "./router/proposal";
import { questionRoutes } from "./router/question";
import { scheduleRoutes } from "./router/schedule";
import { contractRoutes } from "./router/contract";
import { documentRoutes } from "./router/document";
import { dateEventRoutes } from "./router/dateEvent";
import { organizationRoutes } from "./router/organization";
import { notificationRoutes } from "./router/notification";
import { userorganizationRoutes } from "./router/userOrganization";
import { userpermissionRoutes } from "./router/userPermission";
import { seasonalFeeRoutes } from "./router/seasonal-fee";
import { attachmentRoutes } from "./router/attachment";
import { goalRoutes } from "./router/goal";
import { setupSocket } from './service/socket';

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.use(express.json());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }))

app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/text', textRoutes)
app.use('/goal', goalRoutes)
app.use('/image', imageRoutes)
app.use('/venue', venueRoutes)
app.use('/token', tokenRoutes)
app.use('/owner', ownerRoutes)
app.use('/person', personRoutes)
app.use('/clause', clauseRoutes)
app.use('/service', serviceRoutes)
app.use('/expense', expenseRoutes)
app.use('/payment', paymentRoutes)
app.use('/contact', contactRoutes)
app.use('/contract', contractRoutes)
app.use('/question', questionRoutes)
app.use('/document', documentRoutes)
app.use('/proposal', proposalRoutes)
app.use('/schedule', scheduleRoutes)
app.use('/dateEvent', dateEventRoutes)
app.use('/attachment', attachmentRoutes)
app.use('/seasonalFee', seasonalFeeRoutes)
app.use('/notification', notificationRoutes)
app.use('/organization', organizationRoutes)
app.use('/userPermission', userpermissionRoutes)
app.use('/userOrganization', userorganizationRoutes)

const { httpServer, io } = setupSocket(app);

export { app, httpServer, io };

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

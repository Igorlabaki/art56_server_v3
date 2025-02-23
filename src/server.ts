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
import { contactRoutes } from "./router/contact";
import { serviceRoutes } from "./router/service";
import { expenseRoutes } from "./router/expense";
import { paymentRoutes } from "./router/payment";
import { proposalRoutes } from "./router/proposal";
import { questionRoutes } from "./router/question";
import { scheduleRoutes } from "./router/schedule";
import { dateEventRoutes } from "./router/dateEvent";
import { organizationRoutes } from "./router/organization";
import { notificationRoutes } from "./router/notification";
import { userorganizationRoutes } from "./router/userOrganization";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.use(express.json());

app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/text', textRoutes)
app.use('/image', imageRoutes)
app.use('/venue', venueRoutes)
app.use('/token', tokenRoutes)
app.use('/owner', ownerRoutes)
app.use('/person', personRoutes)
app.use('/service', serviceRoutes)
app.use('/expense', expenseRoutes)
app.use('/payment', paymentRoutes)
app.use('/contact', contactRoutes)
app.use('/question', questionRoutes)
app.use('/proposal', proposalRoutes)
app.use('/schedule', scheduleRoutes)
app.use('/dateEvent', dateEventRoutes)
app.use('/notification', notificationRoutes)
app.use('/organization', organizationRoutes)
app.use('/userorganization', userorganizationRoutes)

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

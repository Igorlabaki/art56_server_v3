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
import { userVenuePermissionRoutes } from "./router/userVenuePermission";
import { seasonalFeeRoutes } from "./router/seasonal-fee";
import { attachmentRoutes } from "./router/attachment";
import { goalRoutes } from "./router/goal";
import { emailRoutes } from "./router/email";
import { emailConfigRoutes } from "./router/email-config";
import { userOrganizationPermissionRoutes } from "./router/useOrganizationPermission";

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
app.use('/email', emailRoutes)
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
app.use('/userVenuePermission', userVenuePermissionRoutes)
app.use('/userOrganization', userorganizationRoutes)
app.use('/emailConfig', emailConfigRoutes)
app.use('/userOrganizationPermission', userOrganizationPermissionRoutes)

app.get('/', (req, res) => {
  res.send('API online!');
});

export default app;

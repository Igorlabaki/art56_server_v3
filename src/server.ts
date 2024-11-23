import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { authRoutes } from "./router/auth";
import { tokenRoutes } from "./router/token";
import { organizationRoutes } from "./router/organization";
import { venueRoutes } from "./router/venue";
import { ownerRoutes } from "./router/owner";
import { serviceRoutes } from "./router/service";
import { proposalRoutes } from "./router/proposal";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.use(express.json());

app.use('/auth', authRoutes)
app.use('/token', tokenRoutes)
app.use('/venue', venueRoutes)
app.use('/owner', ownerRoutes)
app.use('/service', serviceRoutes)
app.use('/proposal', proposalRoutes)
app.use('/organization', organizationRoutes)

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

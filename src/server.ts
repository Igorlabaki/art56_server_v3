import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { authRoutes } from "./router/auth";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.use(express.json());

app.use('/auth', authRoutes)

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

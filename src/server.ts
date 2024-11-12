import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.use(express.json());

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

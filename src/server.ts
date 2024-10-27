import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import morgan from "morgan";

import cors from "cors";
import router from "./routes";

dotenv.config();

export const app: Express = express();

app.use(morgan("common"));

//parse JSON bodies
app.use(express.json());


// enable cors
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  })
);

// routes
app.use(router);

import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import morgan from "morgan";

import cors from "cors";
import router from "./routes";

import startReminderCron from "./cron/reminders.cron"

dotenv.config();

startReminderCron()

export const app: Express = express();

app.use(morgan("common"));

//parse JSON bodies
app.use(express.json());


// enable cors
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
  })
);

// routes
app.use(router);

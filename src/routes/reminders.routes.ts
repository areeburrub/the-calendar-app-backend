import { Router } from "express";
import ReminderController from "../controllers/reminder.controller";
import { ApiError } from "../utils/apiError";
import { clerkMiddleware } from "@clerk/express";
import dotenv from "dotenv";

const router = Router();

dotenv.config();

// Apply auth middleware to all routes
router.use(clerkMiddleware(), (req, res, next) => {
  if (req.auth.userId == null) {
    throw new ApiError(401, "Please login to access");
  } else {
    next();
  }
});

router.post("/", ReminderController.createReminder);
router.get("/", ReminderController.getReminders);
router.get("/upcoming", ReminderController.getUpcomingReminders);
router.delete("/:reminderId", ReminderController.deleteReminder);

export default router;

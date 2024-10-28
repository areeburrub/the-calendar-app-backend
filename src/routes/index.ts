import { Router } from "express";
import { errorHandler } from "../middleware/error.middleware";
import eventRoutes from "./event.routes";
import notificationRoutes from "./notification.routes";
import reminderRoutes from "./reminders.routes";

const router = Router();

// Define your routes
router.use("/event", eventRoutes);
router.use("/notification", notificationRoutes);
router.use("/reminder", reminderRoutes);

// @ts-ignore
router.use(errorHandler);

export default router;

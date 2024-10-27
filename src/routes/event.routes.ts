import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import dotenv from "dotenv";
import { ApiError } from "../utils/apiError";

const router = Router();
const eventController = new EventController();

dotenv.config();

// Apply auth middleware to all routes
router.use(clerkMiddleware(), (req, res, next) => {
  if (req.auth.userId == null) {
    throw new ApiError(401, "Please login to access");
  } else {
    next();
  }
});

// Base routes
router.get("/", eventController.getEvents);
router.post("/", eventController.createEvent);

// Additional utility routes
router.get("/upcoming", eventController.getUpcomingEvents);
router.get("/range", eventController.getEventsInRange);

router.get("/:id", eventController.getEvent);
router.put("/:id", eventController.updateEvent);
router.delete("/:id", eventController.deleteEvent);

export default router;

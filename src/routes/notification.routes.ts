import { Router } from "express";
import { subscribe } from "../controllers/notification.controller";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import dotenv from "dotenv";
import { ApiError } from "../utils/apiError";

dotenv.config();

const router = Router();

router.use(clerkMiddleware(), (req, res, next) => {
  if (req.auth.userId == null) {
    throw new ApiError(401, "Please login to access");
  } else {
    next();
  }
});

router.post("/subscribe", subscribe);

export default router;

import { Router } from "express";
import { errorHandler } from "../middleware/error.middleware";
import eventRoutes from "./event.routes";

const router = Router();

// Define your routes
router.use("/event", eventRoutes);

// @ts-ignore
router.use(errorHandler);

export default router;

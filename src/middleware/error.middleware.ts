import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

// Error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if it's an instance of ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    status: "error",
    message: "An unexpected error occurred.",
  });
};

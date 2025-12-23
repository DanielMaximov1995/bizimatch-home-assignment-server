import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  console.error("Unexpected error:", err);

  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
};


import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";
import { JwtPayload } from "../types/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      validated?: any;
      validatedQuery?: any;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      throw new UnauthorizedError("Authentication token required");
    }

    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Invalid token");
    }
    throw error;
  }
};


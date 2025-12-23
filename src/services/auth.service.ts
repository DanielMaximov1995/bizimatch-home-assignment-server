import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { env } from "../config/env.js";
import { ConflictError, UnauthorizedError } from "../utils/errors.js";
import { JwtPayload } from "../types/index.js";

export const register = async (email: string, password: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError("אימייל כבר קיים במערכת!");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError("אימייל או סיסמה שגויים!");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new UnauthorizedError("אימייל או סיסמה שגויים!");
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, env.jwtSecret as jwt.Secret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
};


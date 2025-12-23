import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  DIRECT_URL: process.env.DIRECT_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10),
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
} as const;


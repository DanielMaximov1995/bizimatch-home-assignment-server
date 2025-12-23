import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import expensesRoutes from "./routes/expenses.routes.js";
import invoicesRoutes from "./routes/invoices.routes.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.clientUrl,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api", limiter);

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/invoices", invoicesRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${env.nodeEnv}`);
  console.log(`🔗 Client URL: ${env.clientUrl}`);
});


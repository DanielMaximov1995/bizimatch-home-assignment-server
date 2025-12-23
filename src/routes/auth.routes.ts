import { Router } from "express";
import { register, login } from "../services/auth.service.js";
import { validate } from "../utils/validators.js";
import { registerSchema, loginSchema } from "../utils/validators.js";

const router = Router();

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validated;
    const user = await register(email, password);
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validated;
    const result = await login(email, password);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;


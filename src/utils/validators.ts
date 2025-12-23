import { z } from "zod";
import { ExpenseCategory } from "../types/enums.js";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateCategorySchema = z.object({
  category: z.nativeEnum(ExpenseCategory),
});

export const updateExpenseSchema = z.object({
  businessName: z.string().optional().nullable(),
  businessId: z.string().optional().nullable(),
  serviceDesc: z.string().optional().nullable(),
  invoiceNumber: z.string().optional().nullable(),
  docType: z.enum(["INVOICE", "RECEIPT", "UNKNOWN"]).optional(),
  amountBeforeVat: z.number().nonnegative().optional(),
  amountAfterVat: z.number().nonnegative().optional(),
  transactionDate: z.string().datetime().optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
});

export const expenseFiltersSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  min: z.coerce.number().positive().optional(),
  max: z.coerce.number().positive().optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  business: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const validate = <T>(schema: z.ZodSchema<T>) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error.errors[0]?.message || "Validation error",
        });
      }
      req.validated = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error.errors[0]?.message || "Validation error",
        });
      }
      req.validatedQuery = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};


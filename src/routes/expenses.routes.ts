import { Router } from "express";
import { getExpenses, updateExpenseCategory, updateExpense, deleteExpense } from "../services/expenses.service.js";
import { authenticate } from "../middleware/auth.js";
import { validateQuery, validate, expenseFiltersSchema, updateCategorySchema, updateExpenseSchema } from "../utils/validators.js";

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(expenseFiltersSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const filters = req.validatedQuery;
    const result = await getExpenses(userId, filters);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/category", validate(updateCategorySchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { category } = req.validated;
    const expense = await updateExpenseCategory(id, userId, category);
    res.json({
      success: true,
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", validate(updateExpenseSchema), async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const expense = await updateExpense(id, userId, req.validated);
    res.json({
      success: true,
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await deleteExpense(id, userId);
    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

export default router;


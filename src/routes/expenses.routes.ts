import { Router } from "express";
import { getExpenses, updateExpenseCategory } from "../services/expenses.service.js";
import { authenticate } from "../middleware/auth.js";
import { validateQuery, validate, expenseFiltersSchema, updateCategorySchema } from "../utils/validators.js";

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

export default router;


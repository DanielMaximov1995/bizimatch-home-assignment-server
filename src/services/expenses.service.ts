import prisma from "../config/database.js";
import { ExpenseFilters, ExpenseDTO, PaginatedResponse } from "../types/index.js";
import { NotFoundError } from "../utils/errors.js";
import { ExpenseCategory } from "../types/enums.js";

const toExpenseDTO = (expense: any): ExpenseDTO => ({
  id: expense.id,
  userId: expense.userId,
  businessName: expense.businessName,
  businessId: expense.businessId,
  serviceDesc: expense.serviceDesc,
  invoiceNumber: expense.invoiceNumber,
  docType: expense.docType,
  amountBeforeVat: expense.amountBeforeVat,
  amountAfterVat: expense.amountAfterVat,
  transactionDate: expense.transactionDate,
  category: expense.category,
  rawText: expense.rawText,
  createdAt: expense.createdAt,
});

export const getExpenses = async (
  userId: string,
  filters: ExpenseFilters
): Promise<PaginatedResponse<ExpenseDTO>> => {
  const {
    from,
    to,
    min,
    max,
    category,
    business,
    page = 1,
    pageSize = 20,
  } = filters;

  const where: any = {
    userId,
  };

  if (from || to) {
    where.transactionDate = {};
    if (from) {
      where.transactionDate.gte = new Date(from);
    }
    if (to) {
      where.transactionDate.lte = new Date(to);
    }
  }

  if (min !== undefined || max !== undefined) {
    where.amountAfterVat = {};
    if (min !== undefined) {
      where.amountAfterVat.gte = min;
    }
    if (max !== undefined) {
      where.amountAfterVat.lte = max;
    }
  }

  if (category) {
    where.category = category;
  }

  if (business) {
    where.businessName = {
      contains: business,
      mode: "insensitive",
    };
  }

  const skip = (page - 1) * pageSize;

  const [items, totalCount] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: {
        transactionDate: "desc",
      },
      skip,
      take: pageSize,
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    items: items.map(toExpenseDTO),
    totalCount,
    page,
    pageSize,
  };
};

export const updateExpenseCategory = async (
  expenseId: string,
  userId: string,
  category: ExpenseCategory
): Promise<ExpenseDTO> => {
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      userId,
    },
  });

  if (!expense) {
    throw new NotFoundError("Expense not found");
  }

  const updated = await prisma.expense.update({
    where: {
      id: expenseId,
    },
    data: {
      category,
    },
  });

  return toExpenseDTO(updated);
};


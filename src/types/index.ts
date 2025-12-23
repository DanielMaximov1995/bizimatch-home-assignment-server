import { ExpenseCategory, DocType } from "./enums.js";

export type JwtPayload = {
  userId: string;
  email: string;
};

export type ExtractedFields = {
  docType: DocType;
  amountBeforeVat: number;
  amountAfterVat: number;
  transactionDate: Date;
  businessName?: string;
  businessId?: string;
  serviceDesc?: string;
  invoiceNumber?: string;
  rawText?: string;
};

export type ExpenseFilters = {
  from?: string;
  to?: string;
  min?: number;
  max?: number;
  category?: ExpenseCategory;
  business?: string;
  page?: number;
  pageSize?: number;
};

export type ExpenseDTO = {
  id: string;
  userId: string;
  businessName: string | null;
  businessId: string | null;
  serviceDesc: string | null;
  invoiceNumber: string | null;
  docType: DocType;
  amountBeforeVat: number;
  amountAfterVat: number;
  transactionDate: Date;
  category: ExpenseCategory;
  rawText: string | null;
  createdAt: Date;
};

export type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};


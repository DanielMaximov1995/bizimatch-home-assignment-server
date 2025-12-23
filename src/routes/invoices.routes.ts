import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { authenticate } from "../middleware/auth.js";
import { extractInvoiceData } from "../services/gemini.service.js";
import prisma from "../config/database.js";
import { env } from "../config/env.js";
import { ValidationError } from "../utils/errors.js";
import { ExpenseCategory } from "../types/enums.js";

const router = Router();

router.use(authenticate);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = env.uploadDir;
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError("Invalid file type. Only PDF, JPG, and PNG are allowed"));
    }
  },
});

router.post("/parse", upload.single("file"), async (req, res, next) => {
  let filePath: string | undefined;

  try {
    if (!req.file) {
      throw new ValidationError("No file uploaded");
    }

    filePath = req.file.path;
    const extracted = await extractInvoiceData(filePath, req.file.mimetype);

    res.json({
      success: true,
      data: {
        extracted: {
          docType: extracted.docType,
          amountBeforeVat: extracted.amountBeforeVat,
          amountAfterVat: extracted.amountAfterVat,
          transactionDate: extracted.transactionDate.toISOString(),
          businessName: extracted.businessName,
          businessId: extracted.businessId,
          invoiceNumber: extracted.invoiceNumber,
          serviceDesc: extracted.serviceDesc,
        },
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (filePath) {
      await fs.unlink(filePath).catch(() => {});
    }
  }
});

router.post("/save", async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const {
      businessName,
      businessId,
      serviceDesc,
      invoiceNumber,
      docType,
      amountBeforeVat,
      amountAfterVat,
      transactionDate,
    } = req.body;

    if (!amountAfterVat || !transactionDate) {
      throw new ValidationError("Missing required fields");
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        businessName: businessName || null,
        businessId: businessId || null,
        serviceDesc: serviceDesc || null,
        invoiceNumber: invoiceNumber || null,
        docType: docType || "UNKNOWN",
        amountBeforeVat: amountBeforeVat || 0,
        amountAfterVat,
        transactionDate: new Date(transactionDate),
        category: ExpenseCategory.OTHER,
      },
    });

    res.json({
      success: true,
      data: {
        expense: {
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
          createdAt: expense.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;


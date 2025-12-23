import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import { env } from "../config/env.js";
import { ExtractedFields } from "../types/index.js";
import { DocType } from "../types/enums.js";

let geminiClient: GoogleGenerativeAI | null = null;

const getGeminiClient = (): GoogleGenerativeAI => {
  if (!geminiClient) {
    if (!env.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please set it in your .env file.");
    }
    geminiClient = new GoogleGenerativeAI(env.geminiApiKey);
  }
  return geminiClient;
};

const fileToBase64 = async (filePath: string): Promise<string> => {
  const fileBuffer = await fs.readFile(filePath);
  return fileBuffer.toString("base64");
};

const getMimeType = (mimeType: string): string => {
  if (mimeType === "application/pdf") {
    return "application/pdf";
  }
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return "image/jpeg";
  }
  if (mimeType === "image/png") {
    return "image/png";
  }
  throw new Error(`Unsupported MIME type: ${mimeType}`);
};

export const extractInvoiceData = async (
  filePath: string,
  mimeType: string
): Promise<ExtractedFields> => {
  try {
    const fileData = await fileToBase64(filePath);
    const geminiMimeType = getMimeType(mimeType);
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: "gemini-3-pro-preview" });
    
    const prompt = `אתה מומחה לחילוץ מידע מחשבוניות וקבלות בעברית. 

חלץ את המידע הבא מהמסמך וחזור בתשובה בפורמט JSON בלבד (ללא טקסט נוסף, ללא markdown, רק JSON):

{
  "docType": "INVOICE" | "RECEIPT" | "UNKNOWN",
  "amountAfterVat": מספר (סכום כולל מע"מ - הסכום הסופי לתשלום),
  "amountBeforeVat": מספר (סכום לפני מע"מ),
  "transactionDate": "YYYY-MM-DD" (תאריך העסקה/הפקת החשבון),
  "businessName": "שם העסק" | null,
  "businessId": "מספר עוסק/ח"פ" | null,
  "invoiceNumber": "מספר חשבונית/קבלה" | null,
  "serviceDesc": "תיאור השירות" | null
}

חשוב מאוד:
1. "סכומים חייבים במע"מ" או "סה"כ לתשלום" או "סה"כ שולם" = amountAfterVat (הסכום הכולל אחרי מע"מ)
2. amountBeforeVat = הסכום לפני מע"מ. אם לא נמצא במפורש, חשב: amountAfterVat / 1.18 (עיגל ל-2 ספרות אחרי הנקודה)
3. תאריך בפורמט YYYY-MM-DD (למשל: 2025-12-14). חפש "תאריך הפקת החשבון" או "תאריך עסקה"
4. docType: "INVOICE" אם זה חשבונית, "RECEIPT" אם זה קבלה, "UNKNOWN" אחרת
5. businessName: שם החברה/עסק (למשל "פלאפון תקשורת בע"מ")
6. businessId: מספר עוסק מורשה או ח"פ
7. invoiceNumber: מספר החשבונית או הקבלה
8. החזר רק JSON valid, ללא הסברים, ללא markdown code blocks`;

    const geminiResult = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileData,
          mimeType: geminiMimeType,
        },
      },
    ]);
    
    const response = geminiResult.response;
    const text = response.text();
    
    let jsonText = text.trim();
    
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    
    let extractedData: any;
    try {
      extractedData = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
    }
    
    const transactionDate = extractedData.transactionDate
      ? new Date(extractedData.transactionDate)
      : new Date();
    
    const amountAfterVat = parseFloat(extractedData.amountAfterVat) || 0;
    const amountBeforeVat = extractedData.amountBeforeVat
      ? parseFloat(extractedData.amountBeforeVat)
      : amountAfterVat > 0
      ? Math.round((amountAfterVat / 1.18) * 100) / 100
      : 0;
    
    const result: ExtractedFields = {
      docType: (extractedData.docType as DocType) || DocType.UNKNOWN,
      amountAfterVat,
      amountBeforeVat,
      transactionDate: isNaN(transactionDate.getTime()) ? new Date() : transactionDate,
      businessName: extractedData.businessName || undefined,
      businessId: extractedData.businessId || undefined,
      invoiceNumber: extractedData.invoiceNumber || undefined,
      serviceDesc: extractedData.serviceDesc || undefined,
      rawText: text.substring(0, 5000),
    };
    
    return result;
  } catch (error) {
    throw new Error(
      `Gemini AI processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};


# מערכת ניהול חשבוניות והוצאות - שרת

מערכת לניהול חשבוניות והוצאות לעסק, הכוללת ניתוח אוטומטי של מסמכים באמצעות Gemini AI.

## ארכיטקטורה

המערכת בנויה על Node.js עם Express, ומשתמשת ב-Prisma כשיכבה לניהול מסד הנתונים PostgreSQL.

**מבנה הפרויקט:**
- **Routes** - נקודות קצה ל-API (auth, expenses, invoices)
- **Services** - לוגיקה עסקית (auth, expenses, gemini)
- **Middleware** - אימות JWT וטיפול בשגיאות
- **Config** - הגדרות סביבה ומסד נתונים
- **Types** - הגדרות TypeScript

**תהליך עיבוד חשבוניות:**
1. המשתמש מעלה קובץ PDF או תמונה
2. הקובץ נשלח ל-Gemini AI לחילוץ מידע מובנה
3. המידע נשמר במסד הנתונים
4. המשתמש יכול לסנן ולנהל את ההוצאות

## הפעלת המערכת

**דרישות:**
- Node.js 18+
- PostgreSQL
- Gemini API Key

**התקנה:**
```bash
npm install
```

**הגדרת משתני סביבה (.env):**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
```

**הכנת מסד הנתונים:**
```bash
npx prisma generate
npx prisma db push
```

**הרצה:**
```bash
npm run dev    # פיתוח
npm run build  # בנייה
npm start      # ייצור
```

## אבטחה ותקשורת מאובטחת

**אימות:**
- JWT tokens לכל בקשה מאומתת
- Middleware בודק תקינות הטוקן לפני גישה ל-API
- סיסמאות מוצפנות עם bcrypt

**אמצעי הגנה:**
- Helmet להגדרות אבטחה ב-HTTP headers
- CORS מוגבל לכתובת הלקוח בלבד
- Rate limiting למניעת התקפות DDoS
- Validation עם Zod לכל קלט

**תקשורת:**
- כל התקשורת בין הלקוח לשרת נעשית דרך HTTPS (בייצור)
- טוקנים נשמרים ב-localStorage בצד הלקוח
- כל פעולה רגישה (עיבוד קבצים, שמירת נתונים) דורשת אימות

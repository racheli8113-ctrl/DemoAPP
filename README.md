# RavMeser — ניהול מוזמנים ואירועים

אפליקציית React ו־Spring Boot לניהול רשימת מוזמנים. הפרויקט כולל הרשמה והתחברות עם session, טבלת מוזמנים ניתנת לעריכה, שמירה מול API ותמיכה מלאה בעברית וב־RTL.

## יכולות עיקריות

- מסך פתיחה לבחירה בין יצירת חשבון להתחברות לחשבון קיים.
- הרשמה עם שם, אימייל, טלפון וסיסמה; הסיסמה נשמרת בשרת כ־BCrypt hash בלבד.
- התחברות, שמירת session, בדיקת משתמשת פעילה והתנתקות.
- בדיקת מבנה דומיין וסיומת אימייל נפוצה בצד הלקוח, לדוגמה `gmail.com` או `co.il`.
- טבלת מוזמנים עם חיפוש, סינון סטטוסים ועריכה ישירה בתוך התא.
- הוספה, עדכון ומחיקה של מוזמנים מול REST API.
- טעינה ושמירה אסינכרוניות דרך TanStack Query, עם cache מקומי שמתעדכן לאחר שמירה מוצלחת.
- תצוגת מונים, ממשק רספונסיבי והדפסה מותאמת של הרשימה.

## ספריות ותפקידן

### Frontend

| ספרייה | תפקיד בפרויקט |
| --- | --- |
| `react` | בניית רכיבי הממשק, טפסים וניהול state מקומי. |
| `react-dom` | חיבור אפליקציית React לעמוד ה־HTML באמצעות `createRoot`. |
| `vite` | שרת פיתוח מהיר, build לפרודקשן ותצוגה מקדימה. |
| `@vitejs/plugin-react` | תמיכה ב־JSX וברענון מהיר של רכיבי React בתוך Vite. |
| `@tanstack/react-query` | טעינת נתונים מהשרת, cache, mutations לפעולות שמירה, עריכה ומחיקה, ורענון נתונים. |
| `ag-grid-community` | מנוע טבלה: מיון, סינון, עריכת תאים ועורכי קלט מובנים. |
| `ag-grid-react` | מעטפת React של AG Grid. |
| `lucide-react` | אייקונים בממשק, למשל משתמשים, חיפוש, שמירה, יציאה והדפסה. |

### Backend

| ספרייה | תפקיד בפרויקט |
| --- | --- |
| `spring-boot-starter-web` | יצירת REST API, טיפול בבקשות HTTP והחזרת JSON. |
| `spring-boot-starter-data-jpa` | גישה לנתונים באמצעות repositories ו־JPA/Hibernate. |
| `postgresql` | JDBC driver לחיבור ל־PostgreSQL ול־Neon. |
| `spring-boot-starter-validation` | אימות בקשות הרשמה והתחברות, כולל אימייל, שדות חובה ואורך סיסמה. |
| `spring-security-crypto` | הצפנת סיסמאות עם BCrypt והשוואת סיסמה בהתחברות. הספרייה אינה מפעילה Spring Security מלא. |

## דרישות

- Node.js 20 ומעלה
- Java 21 ומעלה
- Maven 3.9 ומעלה
- PostgreSQL או מסד נתונים ב־Neon

## הפעלה מקומית

### 1. הגדרת בסיס הנתונים

יש להגדיר את פרטי החיבור ל־PostgreSQL באמצעות משתני סביבה לפני הפעלת השרת:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://YOUR-HOST.neon.tech/YOUR_DATABASE?sslmode=require"
$env:SPRING_DATASOURCE_USERNAME="YOUR_USERNAME"
$env:SPRING_DATASOURCE_PASSWORD="YOUR_PASSWORD"
```

### 2. הפעלת ה־backend

```powershell
cd backend
mvn spring-boot:run
```

השרת ירוץ בכתובת `http://localhost:8080`.

### 3. הפעלת ה־frontend

בחלון טרמינל נוסף:

```powershell
cd frontend
npm install
npm run dev
```

פתחי את הכתובת שמודפסת בטרמינל, בדרך כלל `http://localhost:5173`.

## נתיבי API

| פעולה | נתיב | תיאור |
| --- | --- | --- |
| `POST` | `/api/auth/register` | יצירת חשבון חדש והתחלת session. |
| `POST` | `/api/auth/login` | התחברות לחשבון קיים והתחלת session. |
| `GET` | `/api/auth/me` | החזרת פרטי המשתמשת הפעילה. |
| `POST` | `/api/auth/logout` | סיום ה־session. |
| `GET` | `/api/guests` | טעינת רשימת מוזמנים. |
| `POST` | `/api/guests` | הוספת מוזמן. |
| `PUT` | `/api/guests/{id}` | עדכון מוזמן. |
| `DELETE` | `/api/guests/{id}` | מחיקת מוזמן. |

## מבנה הפרויקט

```text
frontend/
  src/App.jsx             מסכי פתיחה, הרשמה, התחברות ולוח ניהול
  src/main.jsx            אתחול React ו־QueryClientProvider
  src/styles.css          עיצוב RTL ורספונסיבי
backend/
  account/                משתמשות, הרשמה, התחברות ו־session
  guest/                  ישות, repository ו־API של מוזמנים
```

## בעלות והרשאות למוזמנים

לכל מוזמן חדש נשמרת משתמשת בעלים (`owner_id`). כל נתיבי `/api/guests` דורשים session פעיל ומחזירים או משנים רק מוזמנים של המשתמשת המחוברת. לכן משתמשת אחת אינה יכולה לטעון, לערוך או למחוק מוזמנים של משתמשת אחרת.

רשומות מוזמנים שנוצרו לפני העדכון אינן משויכות לבעלים ולכן לא יוצגו לאף משתמשת עד שיוקצו ידנית במסד הנתונים.

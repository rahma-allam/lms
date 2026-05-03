import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  // بدلاً من تحديد ملف index، هنخليه يمسح الفولدر كله ويشوف أي ملف .ts
  schema: "./src/schema/**/*.ts", 
  out: "./drizzle",
  dialect: "postgresql", 
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

import { pgTable, serial, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const defaultLanguageEnum = pgEnum("default_language", ["en", "ar"]);

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  academyName: text("academy_name").notNull().default("My Academy"),
  academyNameAr: text("academy_name_ar"),
  logoUrl: text("logo_url"),
  metaPixelId: text("meta_pixel_id"),
  googleTagId: text("google_tag_id"),
  tiktokPixelId: text("tiktok_pixel_id"),
  defaultLanguage: defaultLanguageEnum("default_language").notNull().default("en"),
  currency: text("currency").notNull().default("USD"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;

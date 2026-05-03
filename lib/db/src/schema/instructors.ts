

import { pgTable, serial, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { coursesTable } from "./courses";
import { studentsTable } from "./students";

// ══════════════════════════════════════════════════════════════════════════
// المدربين
// ══════════════════════════════════════════════════════════════════════════

export const instructorsTable = pgTable("instructors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  bio: text("bio"),
  bioAr: text("bio_ar"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ربط المدرب بالكورس (مدرب واحد ممكن يدرّس أكتر من كورس)
export const courseInstructorsTable = pgTable("course_instructors", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
  instructorId: integer("instructor_id").notNull().references(() => instructorsTable.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

// ══════════════════════════════════════════════════════════════════════════
// الشات
// ══════════════════════════════════════════════════════════════════════════

export const senderTypeEnum = pgEnum("sender_type", ["instructor", "student"]);

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
  // المُرسِل — إما مدرب أو طالب
  senderType: senderTypeEnum("sender_type").notNull(),
  senderId: integer("sender_id").notNull(),
  senderName: text("sender_name").notNull(), // محفوظ عشان ما يتأثرش لو اتحذف
  // لو null = رسالة في الشات الجماعي للكورس
  // لو فيه قيمة = رسالة خاصة بين مدرب وطالب
  recipientStudentId: integer("recipient_student_id").references(() => studentsTable.id, { onDelete: "set null" }),
  content: text("content"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// المرفقات
export const messageAttachmentsTable = pgTable("message_attachments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messagesTable.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),            // الاسم الأصلي
  storedFilename: text("stored_filename").notNull(), // الاسم المخزّن (UUID)
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),                 // بالـ bytes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ══════════════════════════════════════════════════════════════════════════
// Schemas و Types
// ══════════════════════════════════════════════════════════════════════════

export const insertInstructorSchema = createInsertSchema(instructorsTable).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export const insertAttachmentSchema = createInsertSchema(messageAttachmentsTable).omit({ id: true, createdAt: true });

export type Instructor = typeof instructorsTable.$inferSelect;
export type InsertInstructor = z.infer<typeof insertInstructorSchema>;
export type Message = typeof messagesTable.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type MessageAttachment = typeof messageAttachmentsTable.$inferSelect;
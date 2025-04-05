import { sql } from "drizzle-orm";
import { mysqlTable, serial, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const sessions = mysqlTable("sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 191 }).notNull(),
  title: varchar("title", { length: 191 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const documents = mysqlTable("documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 191 }).notNull(),
  sessionId: serial("session_id").notNull(),
  title: varchar("title", { length: 191 }).notNull(),
  content: text("content"),
  fileUrl: varchar("file_url", { length: 191 }),
  fileType: varchar("file_type", { length: 191 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const generatedContent = mysqlTable("generated_content", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 191 }).notNull(),
  sessionId: serial("session_id").notNull(),
  documentId: serial("document_id").notNull(),
  type: varchar("type", { length: 191 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}); 
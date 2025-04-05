import { mysqlTable, varchar, text, timestamp, int } from 'drizzle-orm/mysql-core';

export const documents = mysqlTable('documents', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  fileUrl: varchar('file_url', { length: 1000 }),
  fileType: varchar('file_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

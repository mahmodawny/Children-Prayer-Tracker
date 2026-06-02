import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const prayerRecordsTable = sqliteTable("prayer_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  prayerName: text("prayer_name", {
    enum: ["fajr", "dhuhr", "asr", "maghrib", "isha"],
  }).notNull(),
  date: text("date").notNull(),
  performedAt: text("performed_at").notNull().default(""),
});

export const insertPrayerRecordSchema = createInsertSchema(prayerRecordsTable).omit({
  id: true,
  performedAt: true,
});
export type InsertPrayerRecord = z.infer<typeof insertPrayerRecordSchema>;
export type PrayerRecord = typeof prayerRecordsTable.$inferSelect;

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "prayer_tracker.db");

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export function initDb() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'child' CHECK(role IN ('child','admin')),
      points INTEGER NOT NULL DEFAULT 0,
      city TEXT,
      country TEXT,
      created_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS prayer_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      prayer_name TEXT NOT NULL CHECK(prayer_name IN ('fajr','dhuhr','asr','maghrib','isha')),
      date TEXT NOT NULL,
      performed_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      description TEXT NOT NULL,
      description_ar TEXT NOT NULL,
      icon TEXT NOT NULL,
      earned_at TEXT NOT NULL DEFAULT ''
    );
  `);
}

export * from "./schema";

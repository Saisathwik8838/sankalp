import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const isVercel = !!process.env.VERCEL;
const defaultDbPath = isVercel ? '/tmp/sankalp.db' : 'data/sankalp.db';
const dbPath = (process.env.DATABASE_PATH && !isVercel) ? process.env.DATABASE_PATH : defaultDbPath;

// Ensure data folder exists if file database is used
if (dbPath !== ':memory:') {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export const db = new DatabaseSync(dbPath);

// Initialize Tables according to Section 4 of Spec
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sankalps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS day_entries (
      sankalp_id TEXT NOT NULL,
      date TEXT NOT NULL,
      user_id TEXT NOT NULL,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (sankalp_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

// Call on startup
initDb();

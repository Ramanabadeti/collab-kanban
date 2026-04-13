import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, 'kanban.db'),
      driver: sqlite3.Database,
    });
    await db.run('PRAGMA foreign_keys = ON');
  }
  return db;
}

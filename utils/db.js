/* License is GPL 3.0.
- made by studio moremi
- support@studio-moremi.kro.kr
*/
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'moremi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite Database connection failed:', err.message);
  } else {
    console.log('Connected to the moremi.db SQLite database.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT UNIQUE NOT NULL,
      join_date TEXT DEFAULT CURRENT_TIMESTAMP,
      coins INTEGER DEFAULT 2000
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS personal_farm (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      farm_data TEXT DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shared_farm (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT UNIQUE NOT NULL,
      farm_data TEXT DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      day INTEGER NOT NULL,
      days INTEGER NOT NULL,
      reward INTEGER DEFAULT 0
    )
  `);
});

module.exports = db;

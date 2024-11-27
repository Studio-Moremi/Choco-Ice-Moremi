/* License is GPL 3.0.
- made by studio moremi
- op@kkutu.store
*/
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'moremi.db'); // 파일이 없을 때 생성
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
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1
    )
  `); // 유저 테이블

  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1
    )
  `); // 인벤토리 테이블

  db.run(`
    CREATE TABLE IF NOT EXISTS personal_farm (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      farm_data TEXT DEFAULT ''
    )
  `); // 개인 농장 테이블

  db.run(`
    CREATE TABLE IF NOT EXISTS shared_farm (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT UNIQUE NOT NULL,
      farm_data TEXT DEFAULT ''
    )
  `); // 공동농장 테이블

  db.run(`
    CREATE TABLE attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      day INTEGER DEFAULT 1,
      reward INTEGER DEFAULT 0,
      days INTEGER DEFAULT 0
    )
  `); // 출석 테이블
});

module.exports = db;

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database (creates file if not exists)
const dbPath = path.resolve(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create books table
        db.run(`CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT,
      cover TEXT,
      isbn TEXT,
      description TEXT,
      rating INTEGER,
      review TEXT
    )`, (err) => {
            if (err) {
                console.error('Error creating table: ' + err.message);
            } else {
                // Attempt to add columns for existing database
                db.run("ALTER TABLE books ADD COLUMN rating INTEGER", () => { });
                db.run("ALTER TABLE books ADD COLUMN review TEXT", () => { });
            }
        });
    }
});

module.exports = db;

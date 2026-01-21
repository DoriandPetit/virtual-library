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
      review TEXT,
      status TEXT
    )`, (err) => {
            if (err) {
                console.error('Error creating table: ' + err.message);
            } else {
                // Attempt to add columns for existing database
                db.run("ALTER TABLE books ADD COLUMN rating INTEGER", () => { });
                db.run("ALTER TABLE books ADD COLUMN review TEXT", () => { });
                db.run("ALTER TABLE books ADD COLUMN status TEXT", () => { });
            }
        });

        // Create collections table
        db.run(`CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      icon TEXT
    )`, (err) => {
            if (err) console.error('Error creating collections table: ' + err.message);
        });

        // Create book_collections join table
        db.run(`CREATE TABLE IF NOT EXISTS book_collections (
      book_id INTEGER,
      collection_id INTEGER,
      PRIMARY KEY (book_id, collection_id),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
    )`, (err) => {
            if (err) console.error('Error creating book_collections table: ' + err.message);
        });
    }
});

module.exports = db;

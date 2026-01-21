const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Library API is running');
});

// Books Routes
app.get('/api/books', (req, res) => {
    const sql = "SELECT * FROM books ORDER BY id DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

app.post('/api/books', (req, res) => {
    const { title, author, cover, isbn, description, status } = req.body;
    const sql = "INSERT INTO books (title, author, cover, isbn, description, status) VALUES (?, ?, ?, ?, ?, ?)";
    const params = [title, author, cover, isbn, description, status || 'unread'];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: "success",
            data: { id: this.lastID, ...req.body, status: status || 'unread' }
        });
    });
});

app.get('/api/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        let bookData = null;

        // 1. Try OpenLibrary
        try {
            const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
            const data = await response.json();
            const bookKey = `ISBN:${isbn}`;
            if (data[bookKey]) {
                bookData = {
                    title: data[bookKey].title,
                    authors: data[bookKey].authors, // [{name, url}]
                    cover: data[bookKey].cover, // {small, medium, large}
                    description: data[bookKey].description
                };
            }
        } catch (e) {
            console.error("OpenLibrary fetch failed", e);
        }

        // 2. Fallback to Google Books if data is missing or incomplete (specifically cover)
        if (!bookData || !bookData.cover) {
            try {
                const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
                const googleData = await googleRes.json();

                if (googleData.items && googleData.items.length > 0) {
                    const info = googleData.items[0].volumeInfo;
                    const googleCover = info.imageLinks ? {
                        small: info.imageLinks.smallThumbnail,
                        medium: info.imageLinks.thumbnail
                    } : null;

                    // Merge or create bookData
                    if (!bookData) {
                        bookData = {
                            title: info.title,
                            authors: info.authors ? info.authors.map(name => ({ name })) : [],
                            cover: googleCover,
                            description: info.description
                        };
                    } else if (!bookData.cover && googleCover) {
                        bookData.cover = googleCover;
                    }
                }
            } catch (e) {
                console.error("Google Books fetch failed", e);
            }
        }

        if (bookData) {
            res.json(bookData);
        } else {
            res.status(404).json({ error: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch book data" });
    }
});

app.get('/api/search/online', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query parameter 'q' is required" });

    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20`);
        const data = await response.json();

        const results = (data.items || []).map(item => {
            const info = item.volumeInfo;
            const isbnIdentifier = info.industryIdentifiers?.find(id => id.type === 'ISBN_13') || info.industryIdentifiers?.find(id => id.type === 'ISBN_10');
            return {
                title: info.title,
                author: info.authors ? info.authors.join(', ') : 'Unknown Author',
                cover: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null,
                isbn: isbnIdentifier ? isbnIdentifier.identifier : null,
                description: info.description || ''
            };
        });

        res.json({ data: results });
    } catch (error) {
        console.error("Search failed", error);
        res.status(500).json({ error: "Failed to search Google Books" });
    }
});

app.patch('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE books SET ${setClause} WHERE id = ?`;

    db.run(sql, [...values, id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: "updated",
            changes: this.changes,
            data: { id, ...updates }
        });
    });
});

app.delete('/api/books/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM books WHERE id = ?", id, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: "deleted", changes: this.changes });
    });
});

// Collections Routes
app.get('/api/collections', (req, res) => {
    const sql = "SELECT * FROM collections ORDER BY title ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/collections', (req, res) => {
    const { title, icon } = req.body;
    const sql = "INSERT INTO collections (title, icon) VALUES (?, ?)";
    db.run(sql, [title, icon], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: { id: this.lastID, title, icon } });
    });
});

app.delete('/api/collections/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM collections WHERE id = ?", id, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "deleted", changes: this.changes });
    });
});

// Book-Collection Association Routes
app.get('/api/collections/:id/books', (req, res) => {
    const { id } = req.params;
    const sql = `
      SELECT b.* 
      FROM books b
      JOIN book_collections bc ON b.id = bc.book_id
      WHERE bc.collection_id = ?
      ORDER BY b.id DESC
    `;
    db.all(sql, [id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.post('/api/collections/:id/books', (req, res) => {
    const { id } = req.params;
    const { bookId } = req.body;
    const sql = "INSERT OR IGNORE INTO book_collections (book_id, collection_id) VALUES (?, ?)";
    db.run(sql, [bookId, id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", changes: this.changes });
    });
});

app.get('/api/books/:id/collections', (req, res) => {
    const { id } = req.params;
    const sql = `
      SELECT c.* 
      FROM collections c
      JOIN book_collections bc ON c.id = bc.collection_id
      WHERE bc.book_id = ?
    `;
    db.all(sql, [id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.delete('/api/collections/:id/books/:bookId', (req, res) => {
    const { id, bookId } = req.params;
    const sql = "DELETE FROM book_collections WHERE book_id = ? AND collection_id = ?";
    db.run(sql, [bookId, id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "deleted", changes: this.changes });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

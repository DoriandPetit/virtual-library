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
    const { title, author, cover, isbn, description } = req.body;
    const sql = "INSERT INTO books (title, author, cover, isbn, description) VALUES (?, ?, ?, ?, ?)";
    const params = [title, author, cover, isbn, description];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: "success",
            data: { id: this.lastID, ...req.body }
        });
    });
});

app.get('/api/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
        const data = await response.json();
        const bookKey = `ISBN:${isbn}`;
        if (data[bookKey]) {
            res.json(data[bookKey]);
        } else {
            res.status(404).json({ error: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch from OpenLibrary" });
    }
});

app.patch('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const { rating, review } = req.body;

    const sql = "UPDATE books SET rating = ?, review = ? WHERE id = ?";
    db.run(sql, [rating, review, id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            message: "updated",
            changes: this.changes,
            data: { id, rating, review }
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

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

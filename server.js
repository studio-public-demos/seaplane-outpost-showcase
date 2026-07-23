const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new Database('ddmp.db');

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'andhra-tourism.html'));
});

db.prepare(`
    CREATE TABLE IF NOT EXISTS contact_enquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        destination TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

app.post('/api/contact', (req, res) => {
    try {
        const { name, email, phone, destination, message } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, error: 'Name and email are required' });
        }

        const stmt = db.prepare(`
            INSERT INTO contact_enquiries (name, email, phone, destination, message)
            VALUES (?, ?, ?, ?, ?)
        `);

        const info = stmt.run(name, email, phone, destination, message);

        res.status(201).json({ success: true, id: info.lastInsertRowid });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Andhra Tourism server running on http://localhost:${PORT}`);
});
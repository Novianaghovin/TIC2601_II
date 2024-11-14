const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const router = express.Router();
const app = express();
const PORT = 3002;

/* Middleware */ 
app.use(cors());
app.use(express.json());

// Define the path to the existing database file
const DB_PATH = path.resolve(__dirname, '../database/database.db');
console.log('Database Path:', DB_PATH); // Debugging path

// Connect to the existing database instance
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the existing SQLite database successfully.');
    }
});

// Leaderboard endpoint
app.get('/api/leaderboard/:challengeID', (req, res) => {
    const challengeID = req.params.challengeID;
    const sql = `SELECT * FROM leaderboard WHERE challenge_id = ? ORDER BY datetime(time_stamp) ASC`;

    db.all(sql, [challengeID], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Database query error.' });
            return;
        }
        const etag = JSON.stringify(rows); // Simple ETag based on data
        if (req.headers['if-none-match'] === etag) {
            res.status(304).end(); // Not Modified
            return;
        }
        res.set('ETag', etag);
        res.json({ success: true, leaderboard: rows });
    });
});


// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = router
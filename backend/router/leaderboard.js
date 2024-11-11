const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3001;

/* Middleware */ 
app.use(cors());
app.use(express.json());

// Define the path to the existing database file
const DB_PATH = path.resolve(__dirname, '../database/database.db');

// Connect to the existing database instance
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the existing SQLite database successfully.');
    }
});

// Route to fetch challenge id from the database
app.get('/api/get-challenge/:challengeID', (req, res) => {
    const challengeId = req.params.challengeID;

    // Check if challenge ID is a valid number
    if (isNaN(challengeId)) {
        return res.status(400).json({ error: 'Invalid Challenge ID' });
    }

    console.log('Fetching Challenge ID:', challengeId);

    // Query the database to fetch the challenge_id from the avail_challenges table
    db.get('SELECT * FROM avail_challenges WHERE challenge_id = ?', [challengeId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'Challenge not found' });
        }
    });
});

app.get('/api/leaderboard/:challengeId', (req, res) => {
    const challengeId = req.params.challengeId;

    // SQL query to fetch the leaderboard of the specific challenge ID
    const sql = `
        SELECT *
        FROM leaderboard ld
        WHERE ld.challenge_id = ? 
        ORDER BY time_stamp ASC`;   // Ranking by earliest timestamp as the top rank

    db.all(sql, [challengeId], (err, rows) => {
        if (err) {
            console.error('Error fetching leaderboard data:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows); 
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



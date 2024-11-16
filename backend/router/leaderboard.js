const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

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

app.get('/api/leaderboard/:challengeID', (req, res) => {
    const challengeID = req.params.challengeID;

    // SQL query to fetch the leaderboard of the specific challenge ID
    const sql = `
        SELECT *
        FROM leaderboard ld
        WHERE ld.challenge_id = ? 
        ORDER BY time_stamp ASC`;   // Ranking by earliest timestamp as the top rank

    db.all(sql, [challengeID], (err, rows) => {
        if (err) {
            console.error('Error fetching leaderboard data:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows); 
    });
});

module.exports = router;

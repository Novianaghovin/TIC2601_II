const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const authenticateToken = require('../authenticateToken');
const router = express.Router();


// Define the path to the existing database file
const DB_PATH = path.resolve(__dirname, '../database.db');

// Connect to the existing database instance
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('leaderboard connected to the database.');
    }
});

// Route to fetch "My Challenges" (challenges the user has joined)
router.get('/leaderboard/my-challenges',authenticateToken, (req, res) => {
    const userId = req.user.userId;

    // SQL query to fetch the challenges that the user has joined
    const sql = `
        SELECT *
        FROM user_challenges uc
        WHERE uc.user_id = ? `;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching user challenges:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows); // Return the joined challenges for the user
    });
});

console.log('Leaderboard route loaded');

router.get('/leaderboard/:challengeId', authenticateToken, (req, res) => {
    const challengeId = req.params.challengeId;

    const sql = `
        SELECT * FROM leaderboard 
        WHERE challenge_id = ? 
        ORDER BY datetime(time_stamp) ASC`;

    db.all(sql, [challengeId], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Database query error.' });
            return;
        }

        // Directly return the rows without using ETag
        res.json({ success: true, leaderboard: rows });
    });
});


module.exports = router
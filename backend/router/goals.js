const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const router = express.Router();
const authenticateToken = require('../authenticateToken'); // Import token authentication middleware

// Initialize the database
const db = new sqlite3.Database(path.join(__dirname, '../database.db'), (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
        process.exit(1); // Exit process if database connection fails
    } else {
        console.log('Connected to the database.');
    }
});

console.log('Badge route loaded');

// Get all badges for the logged-in user with a specific month and year
router.get('/badgeCompleted/:month/:year', authenticateToken, (req, res) => {
    const { month, year } = req.params; // Extract month and year from URL params
    const { userId } = req.user; // Extract userId from the decoded token

    if (!userId) {
        console.error('User ID is undefined or missing.');
        return res.status(400).json({ error: 'User ID not found in token' });
    }

    console.log(`Received request for user_id: ${userId}, month: ${month}, year: ${year}`);

    const sql = `
    SELECT DISTINCT 
        uc.user_id, 
        uc.status, 
        uc.progress, 
        lb.time_stamp
    FROM 
        user_challenges uc
    JOIN 
        leaderboard lb ON uc.user_id = lb.user_id AND uc.challenge_id = lb.challenge_id
    WHERE 
        uc.status = 'Completed'
        AND strftime('%Y', lb.time_stamp) = ?  -- Year filter
        AND strftime('%m', lb.time_stamp) = ?  -- Month filter
        AND uc.user_id = ?;  -- User filter
    `;

    db.all(sql, [year, month, userId], (err, rows) => {
        if (err) {
            console.error('Error fetching badges:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        console.log('Fetched rows:', rows); // Log fetched rows
        res.json(rows.length > 0 ? rows : []); // Return results or empty array
    });
});

// Other badge-related routes (add, update, delete) can follow a similar pattern
// Ensure that user_id is always passed from the token for these actions

module.exports = router;

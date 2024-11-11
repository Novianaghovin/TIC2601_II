// badgeRouter.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// Correct path to the SQLite database (use forward slashes or double backslashes)
const db = new sqlite3.Database('C:/Users/Viana Gho/OneDrive/Desktop/DB.Browser.for.SQLite-v3.13.0-win64/testing.db');

// Get badges data based on the challenge month
router.get('/badge', (req, res) => {
    const { month } = req.query; // Accepts a query parameter for filtering by month (e.g., 2024-03)

    // If no month is provided, use the current month as a fallback
    const monthFilter = month || new Date().toISOString().slice(0, 7); // 'YYYY-MM' format

    // Query to fetch user_id, badge_name, challenge_deadline, and status by month
    const sql = `
        SELECT 
            uc.user_id,
            bt.badge_name,
            ac.challenge_deadline,
            uc.status
        FROM 
            user_challenges uc
        JOIN 
            avail_challenges ac ON uc.challenge_id = ac.challenge_id
        JOIN 
            badge_type bt ON ac.badge_id = bt.badge_id
        WHERE 
            uc.user_id = ? AND strftime('%Y-%m', ac.challenge_deadline) = ?
        ORDER BY 
            uc.user_id, ac.challenge_deadline;
    `;

    // Run the query with the dynamic month filter
    db.all(sql, [monthFilter], (err, rows) => {
        if (err) {
            console.error('Error fetching badges:', err.message); // Log the error for debugging
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // If no results are found, return an empty array
        res.json(rows.length > 0 ? rows : []);
    });
});

module.exports = router;

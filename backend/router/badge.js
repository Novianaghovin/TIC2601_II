// badgeRouter.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

//http://localhost:3000/badge?user_id=1
// Correct path to the SQLite database (use forward slashes or double backslashes)
const db = new sqlite3.Database('C:/Users/Viana Gho/OneDrive/Desktop/DB.Browser.for.SQLite-v3.13.0-win64/testing.db');

router.get('/badge', (req, res) => {
    const { user_id, month } = req.query; // Accepts user_id and month query parameters

    // If no month is provided, use the current month as a fallback
    const monthFilter = month || new Date().toISOString().slice(0, 7); // 'YYYY-MM' format

    // Ensure user_id is provided
    if (!user_id) {
        return res.status(400).json({ error: 'user_id query parameter is required' });
    }

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

    db.all(sql, [user_id, monthFilter], (err, rows) => {
        if (err) {
            console.error('Error fetching badges:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json(rows.length > 0 ? rows : []);
    });
});

module.exports = router;
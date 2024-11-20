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
        console.log('badge connected to the database.');
    }
});


// Middleware to parse JSON requests
router.use(express.json());

router.get('/badgeCompleted/:month/:year', authenticateToken, (req, res) => {
    const { month, year } = req.params; // Get month and year from URL params
    const { userId } = req.user; // Access the userId from the token payload (use userId, not user_id)

    console.log(`Received request for user_id: ${userId}, month: ${month}, year: ${year}`); // Log the userId

    // SQL query to fetch completed badges for the specific user, month, and year
    const sql = `
        SELECT DISTINCT 
            uc.user_id, 
            uc.status, 
            uc.progress, 
            lb.time_stamp,
            bt.badge_name
        FROM 
            user_challenges uc
        JOIN 
            leaderboard lb ON uc.user_id = lb.user_id AND uc.challenge_id = lb.challenge_id
        JOIN
            avail_challenges ac ON uc.challenge_id = ac.challenge_id
        JOIN
            badge_type bt ON ac.badge_id = bt.badge_id
        WHERE 
            uc.status = 'Completed'
            AND strftime('%Y', lb.time_stamp) = ?  -- Filter by year
            AND strftime('%m', lb.time_stamp) = ?  -- Filter by month
            AND uc.user_id = ?;  -- Filter by userId (not user_id)
    `;

    // Execute the SQL query with parameters
    db.all(sql, [year, month, userId], (err, rows) => {
        if (err) {
            console.error('Error fetching badges:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        console.log('Fetched rows:', rows);
        res.json(rows.length > 0 ? rows : []); // Return the badges or an empty array if none found
    });
});


module.exports = router;

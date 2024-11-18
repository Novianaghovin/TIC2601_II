const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// Initialize the database
const db = new sqlite3.Database(path.join(__dirname, '../database.db'), (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
        process.exit(1); // Exit process if database connection fails
    } else {
        console.log('Connected to the database badge.');
    }
});

// Middleware to parse JSON requests
app.use(express.json());

// Route: Get all completed badges for a specific user, month, and year
app.get('/api/badgeCompleted/:user_id/:month/:year', (req, res) => {
    const { user_id, month, year } = req.params; // Get user_id, month, and year from URL parameters
    console.log(`Received request for user_id: ${user_id}, month: ${month}, year: ${year}`); // Log parameters

    // SQL Query to fetch completed badges for the specific user, month, and year
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

    db.all(sql, [year, month, user_id], (err, rows) => {
        if (err) {
            console.error('Error fetching badges:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        console.log('Fetched rows:', rows); // Log the fetched rows

        res.json(rows.length > 0 ? rows : []);
    });
});

// Start the server
const port = 3001;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// badgeRouter.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'database.db');
console.log("Database path: ", dbPath); // Log the database path to check if it's correct

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Could not connect to database:", err.message);
    } else {
        console.log("Connected to the SQLite database badge.");
    }
});

// Helper function to get the current month in 'YYYY-MM' format
const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

// Helper function to get the previous month in 'YYYY-MM' format
const getPreviousMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 7);
};

// Route 1: Filter by user_id with the current month
//http://localhost:3000/badge/current?user_id=1

router.get('/badge/current', (req, res) => {
    const { user_id } = req.query; // Accepts user_id as query parameter

    if (!user_id) {
        return res.status(400).json({ error: 'user_id query parameter is required' });
    }

    const currentMonth = getCurrentMonth(); // Get the current month

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

    db.all(sql, [user_id, currentMonth], (err, rows) => {
        if (err) {
            console.error('Error fetching badges:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json(rows.length > 0 ? rows : []);
    });
});

// Route 2: Filter by user_id with the previous month
// 
router.get('/badge/previous', (req, res) => {
    const { user_id } = req.query; // Accepts user_id as query parameter

    if (!user_id) {
        return res.status(400).json({ error: 'user_id query parameter is required' });
    }

    const previousMonth = getPreviousMonth(); // Get the previous month

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

    db.all(sql, [user_id, previousMonth], (err, rows) => {
        if (err) {
            console.error('Error fetching badges:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json(rows.length > 0 ? rows : []);
    });
});

module.exports = router;



/*
to try this when web app completed
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// Correct path to the SQLite database (use forward slashes or double backslashes)
const db = new sqlite3.Database("C:/Users/Viana Gho/OneDrive/Desktop/testing_13_11.db", (err) => {
    if (err) {
        console.error("Could not connect to database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Helper function to get the current date in 'YYYY-MM-DD' format
const getCurrentDate = () => new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

// Route 1: Filter by user_id with the current month
router.get('/badge/current', (req, res) => {
    const { user_id } = req.query; // Accepts user_id as query parameter

    if (!user_id) {
        return res.status(400).json({ error: 'user_id query parameter is required' });
    }

    const currentMonth = getCurrentMonth(); // Get the current month

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

    db.all(sql, [user_id, currentMonth], (err, rows) => {
        if (err) {
            console.error('Error fetching badges:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json(rows.length > 0 ? rows : []);
    });
});

// Route 2: Filter by user_id with the previous month
router.get('/badge/previous', (req, res) => {
    const { user_id } = req.query; // Accepts user_id as query parameter

    if (!user_id) {
        return res.status(400).json({ error: 'user_id query parameter is required' });
    }

    const previousMonth = getPreviousMonth(); // Get the previous month

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

    db.all(sql, [user_id, previousMonth], (err, rows) => {
        if (err) {
            console.error('Error fetching badges:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json(rows.length > 0 ? rows : []);
    });
});

// Route 3: Update status to 'completed' and change the date to the current date
router.put('/badge/complete', (req, res) => {
    const { user_id, challenge_id } = req.body; // Accepts user_id and challenge_id in the request body

    if (!user_id || !challenge_id) {
        return res.status(400).json({ error: 'user_id and challenge_id are required' });
    }

    const currentDate = getCurrentDate(); // Get the current date

    const sql = `
        UPDATE user_challenges
        SET status = 'completed', completed_date = ?
        WHERE user_id = ? AND challenge_id = ?;
    `;

    db.run(sql, [currentDate, user_id, challenge_id], function (err) {
        if (err) {
            console.error('Error updating badge status:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Challenge not found for this user' });
        }

        res.json({ message: 'Status updated to completed and date set to current.' });
    });
});

module.exports = router;

*/ 

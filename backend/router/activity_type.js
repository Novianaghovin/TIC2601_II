const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();

// Initialize the database
const db = new sqlite3.Database(path.join(__dirname, '../database.db'), (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
        process.exit(1); // Exit process if database connection fails
    } else {
        console.log('Connected to the database.');
    }
});

console.log('Activity type route loaded');

// View all activity types
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM activity_type';
    db.all(sql, (err, rows) => {
        if (err) {
            console.error('Error retrieving activity types:', err.message);
            return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
        }
        res.status(200).json(rows);
    });
});

module.exports = router;
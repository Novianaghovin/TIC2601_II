const express = require('express')
const sqlite3 = require('sqlite3').verbose()

const router = express.Router()
const db = new sqlite3.Database('C:/Users/Yuan/Documents/GitHub/TIC2601_II/backend/database/database3.db')

// View all activity types
router.get('/', (req, res) => {
    db.all('SELECT * FROM activity_type', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

module.exports = router;
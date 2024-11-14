const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const db = new sqlite3.Database('./database/database.db');

// Example route for testing
router.get('/', (req, res) => {
    res.send('Activity log route is working!');
});


// Get all activity logs by user ID (User can only view their own activities)
router.get('/user/:user_id', (req, res) => {
    const userId = req.params.user_id;
    const sql = `
        SELECT 
            activity_log.log_id, 
            activity_type.activity_name, 
            activity_log.activity_duration, 
            activity_log.distance, 
            activity_log.step_count, 
            activity_log.calories_burnt, 
            activity_log.timestamp
        FROM activity_log
        JOIN activity_type ON activity_log.activity_id = activity_type.activity_id
        WHERE activity_log.user_id = ?
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(404).json({ error: 'No activity logs found for this user.' });
        }
    });
});

// Create a new activity log (User can only add their own activities)
router.post('/', (req, res) => {
    const { activity_name, activity_duration, distance, step_count, user_id } = req.body;

    // Validate required inputs
    if (!activity_name || !activity_duration || !distance || !step_count || !user_id) {
        return res.status(400).send('Bad Request: All fields (activity name, duration, distance, steps, user ID) are required.');
    }

    // Validate activity type
    const validActivities = ['run', 'swim', 'cycle', 'walk'];
    if (!validActivities.includes(activity_name.toLowerCase())) {
        return res.status(400).send('Bad Request: Invalid activity name. Choose from run, swim, cycle, or walk.');
    }

    // Fetch the activity multiplier based on activity type
    const sqlGetMultiplier = 'SELECT activity_multiplier FROM activity_type WHERE LOWER(activity_name) = ?';
    db.get(sqlGetMultiplier, [activity_name.toLowerCase()], (err, row) => {
        if (err) {
            console.error('Error retrieving activity multiplier:', err);
            return res.status(500).send('Internal Server Error: Unable to retrieve activity multiplier.');
        }
        if (!row) {
            return res.status(404).send('Not Found: Invalid activity type.');
        }

        // Calculate calories burned (Formula: duration * multiplier)
        const calories_burnt = activity_duration * row.activity_multiplier;

        // Insert the new activity log
        const sqlInsert = `
            INSERT INTO activity_log (activity_duration, distance, step_count, calories_burnt, activity_id, user_id)
            VALUES (?, ?, ?, ?, (SELECT activity_id FROM activity_type WHERE LOWER(activity_name) = ?), ?)
        `;
        db.run(sqlInsert, [activity_duration, distance, step_count, calories_burnt, activity_name.toLowerCase(), user_id], function (err) {
            if (err) {
                console.error('Error inserting activity log:', err);
                return res.status(500).send('Internal Server Error: ' + err.message);
            }

            // Retrieve the newly inserted log entry to send back as response
            const newLogId = this.lastID;
            const sqlSelectNewLog = `
                SELECT 
                    activity_log.log_id, 
                    activity_type.activity_name, 
                    activity_log.activity_duration, 
                    activity_log.distance, 
                    activity_log.step_count, 
                    activity_log.calories_burnt, 
                    activity_log.timestamp
                FROM activity_log
                JOIN activity_type ON activity_log.activity_id = activity_type.activity_id
                WHERE activity_log.log_id = ?
            `;
            db.get(sqlSelectNewLog, [newLogId], (err, newLog) => {
                if (err) {
                    console.error('Error retrieving new activity log:', err);
                    return res.status(500).send('Internal Server Error: ' + err.message);
                }

                res.status(201).json(newLog);  // Return the newly created entry as JSON
            });
        });
    });
});

module.exports = router;
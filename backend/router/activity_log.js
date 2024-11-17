const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const db = new sqlite3.Database('../database.db');

// Helper function to recalculate goal progress
const recalculateProgressForGoals = (userId, activityId, callback) => {
    const sql = `
        SELECT goal_id
        FROM goals
        WHERE user_id = ? AND activity_id = ?
    `;
    db.all(sql, [userId, activityId], (err, goals) => {
        if (err) {
            return callback(err);
        }

        if (!goals || goals.length === 0) {
            return callback(null); // No associated goals to update
        }

        const progressUpdates = goals.map((goal) => {
            return new Promise((resolve, reject) => {
                const sqlRecalculate = `
                    SELECT 
                        g.target_distance, 
                        g.created_date, 
                        g.goal_deadline, 
                        IFNULL(SUM(al.distance), 0) AS total_distance
                    FROM goals g
                    LEFT JOIN activity_log al 
                        ON g.user_id = al.user_id 
                        AND g.activity_id = al.activity_id 
                        AND al.timestamp >= g.created_date 
                        AND al.timestamp <= g.goal_deadline
                    WHERE g.goal_id = ?
                    GROUP BY g.goal_id
                `;
                db.get(sqlRecalculate, [goal.goal_id], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        const progress = Math.min(100, (row.total_distance / row.target_distance) * 100).toFixed(2);
                        const sqlUpdate = `UPDATE goals SET progress = ? WHERE goal_id = ?`;
                        db.run(sqlUpdate, [progress, goal.goal_id], (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        });

        Promise.all(progressUpdates)
            .then(() => callback(null))
            .catch((err) => callback(err));
    });
};

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

            // Recalculate progress for associated goals
            const activityId = this.lastID;
            recalculateProgressForGoals(user_id, activityId, (err) => {
                if (err) {
                    console.error('Error recalculating progress:', err);
                    return res.status(500).send('Error recalculating progress: ' + err.message);
                }

                // Retrieve the newly inserted log entry to send back as response
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
                db.get(sqlSelectNewLog, [activityId], (err, newLog) => {
                    if (err) {
                        console.error('Error retrieving new activity log:', err);
                        return res.status(500).send('Internal Server Error: ' + err.message);
                    }

                    res.status(201).json(newLog); // Return the newly created entry as JSON
                });
            });
        });
    });
});

module.exports = router;
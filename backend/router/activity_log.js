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

console.log('Activity log route loaded');

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

// Get all activity logs for the logged-in user
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.userId; // Extract user ID from token
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
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        res.status(200).json(rows.length > 0 ? rows : { message: 'No activity logs found for this user.' });
    });
});

// Create a new activity log
router.post('/', authenticateToken, (req, res) => {
    const { activity_name, activity_duration, distance, step_count } = req.body;
    const userId = req.user.userId; // Extracted from token

    // Validate required inputs
    if (!activity_name || !activity_duration || !distance || !step_count) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sqlGetActivity = 'SELECT activity_id, activity_multiplier FROM activity_type WHERE LOWER(activity_name) = ?';
    db.get(sqlGetActivity, [activity_name.toLowerCase()], (err, row) => {
        if (err) {
            console.error('Error retrieving activity multiplier:', err);
            return res.status(500).json({ error: 'Unable to retrieve activity multiplier.' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Invalid activity type.' });
        }

        const { activity_id, activity_multiplier } = row;
        const calories_burnt = activity_duration * activity_multiplier;

        const sqlInsert = `
            INSERT INTO activity_log (activity_duration, distance, step_count, calories_burnt, activity_id, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.run(sqlInsert, [activity_duration, distance, step_count, calories_burnt, activity_id, userId], function (err) {
            if (err) {
                console.error('Error inserting activity log:', err);
                return res.status(500).json({ error: 'Unable to create activity log.' });
            }

            recalculateProgressForGoals(userId, activity_id, (err) => {
                if (err) {
                    console.error('Error recalculating progress:', err);
                    return res.status(500).json({ error: 'Error recalculating goal progress.' });
                }
                res.status(201).json({ message: 'Activity log created successfully.' });
            });
        });
    });
});

module.exports = router;
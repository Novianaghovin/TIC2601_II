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
        console.log('goals connected to the database.');
    }
});

console.log('Goals route loaded');

// Helper function to validate ISO date format
const isValidISODate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString() === dateString;
};

// Helper function to validate goal data
const validateGoalData = ({ goal_name, goal_deadline, target_distance, activity_id }) => {
    if (!goal_name || typeof goal_name !== 'string') {
        return 'Goal name is required and must be a string.';
    }
    if (!goal_deadline || !isValidISODate(goal_deadline)) {
        return 'Goal deadline is required and must be in ISO format.';
    }
    if (!target_distance || isNaN(target_distance) || target_distance <= 0) {
        return 'Target distance is required and must be a positive number.';
    }
    if (!activity_id || isNaN(activity_id) || activity_id <= 0) {
        return 'Activity ID is required and must be a positive number.';
    }
    return null; // No errors
};

// Helper function to calculate progress
const calculateProgress = (goalId, callback) => {
    const sql = `
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

    db.get(sql, [goalId], (err, row) => {
        if (err) {
            return callback(err, null);
        }
        if (!row) {
            return callback(null, 0); // No progress if no matching goal found
        }
        const progress = Math.min(100, (row.total_distance / row.target_distance) * 100).toFixed(2);
        callback(null, parseFloat(progress));
    });
};

// Recalculate progress for all existing goals in the database
const recalculateAllProgress = () => {
    const sqlGetGoals = `SELECT goal_id FROM goals`;

    db.all(sqlGetGoals, [], (err, goals) => {
        if (err) {
            console.error('Error fetching goals: ' + err.message);
            return;
        }

        goals.forEach((goal) => {
            calculateProgress(goal.goal_id, (err, progress) => {
                if (err) {
                    console.error(`Error calculating progress for goal_id ${goal.goal_id}: ` + err.message);
                } else {
                    const sqlUpdateProgress = `UPDATE goals SET progress = ? WHERE goal_id = ?`;
                    db.run(sqlUpdateProgress, [progress, goal.goal_id], (err) => {
                        if (err) {
                            console.error(`Error updating progress for goal_id ${goal.goal_id}: ` + err.message);
                        } else {
                            console.log(`Progress updated for goal_id ${goal.goal_id}: ${progress}%`);
                        }
                    });
                }
            });
        });
    });
};

// Call recalculateAllProgress on server startup
recalculateAllProgress();

// Get all goals for the logged-in user with updated progress
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    const sql = `
        SELECT g.goal_id, g.goal_name, g.goal_deadline, g.target_distance, g.progress, g.user_id, 
               at.activity_name
        FROM goals g
        JOIN activity_type at ON g.activity_id = at.activity_id
        WHERE g.user_id = ?
    `;

    db.all(sql, [userId], async (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const updatedGoals = await Promise.all(
            rows.map(async (goal) => {
                return new Promise((resolve, reject) => {
                    calculateProgress(goal.goal_id, (err, progress) => {
                        if (err) {
                            reject(err);
                        } else {
                            goal.progress = parseFloat(progress) || 0;
                            resolve(goal);
                        }
                    });
                });
            })
        );

        res.status(200).json(updatedGoals);
    });
});

// Create a new goal for the logged-in user
router.post('/', authenticateToken, (req, res) => {
    const { goal_name, goal_deadline, target_distance, activity_id } = req.body;
    const userId = req.user.userId;

    const validationError = validateGoalData({ goal_name, goal_deadline, target_distance, activity_id });
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const sqlInsert = `
        INSERT INTO goals (goal_name, goal_deadline, target_distance, progress, user_id, activity_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sqlInsert, [goal_name, goal_deadline, target_distance, 0, userId, activity_id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
        }

        const newGoalId = this.lastID;
        calculateProgress(newGoalId, (err, progress) => {
            if (err) {
                return res.status(500).json({ error: 'Error calculating progress: ' + err.message });
            }

            const sqlUpdate = `UPDATE goals SET progress = ? WHERE goal_id = ?`;
            db.run(sqlUpdate, [progress, newGoalId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error updating progress: ' + err.message });
                }

                db.get('SELECT * FROM goals WHERE goal_id = ?', [newGoalId], (err, newGoal) => {
                    if (err) {
                        return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
                    }

                    newGoal.progress = parseFloat(newGoal.progress) || 0;
                    res.status(201).json(newGoal);
                });
            });
        });
    });
});

// Update a goal for the logged-in user
router.put('/:goal_id', authenticateToken, (req, res) => {
    const goalId = req.params.goal_id;
    const { goal_name, goal_deadline, target_distance, activity_id } = req.body;
    const userId = req.user.userId;

    const validationError = validateGoalData({ goal_name, goal_deadline, target_distance, activity_id });
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const sqlUpdate = `
        UPDATE goals 
        SET goal_name = ?, goal_deadline = ?, target_distance = ?, activity_id = ?
        WHERE goal_id = ? AND user_id = ?
    `;

    db.run(sqlUpdate, [goal_name, goal_deadline, target_distance, activity_id, goalId, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        calculateProgress(goalId, (err, progress) => {
            if (err) {
                return res.status(500).json({ error: 'Error recalculating progress' });
            }

            const sqlProgressUpdate = `UPDATE goals SET progress = ? WHERE goal_id = ?`;
            db.run(sqlProgressUpdate, [progress, goalId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error updating progress' });
                }

                db.get('SELECT * FROM goals WHERE goal_id = ?', [goalId], (err, updatedGoal) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error retrieving updated goal' });
                    }

                    updatedGoal.progress = parseFloat(updatedGoal.progress) || 0;
                    res.status(200).json(updatedGoal);
                });
            });
        });
    });
});

// Delete a goal for the logged-in user
router.delete('/:goal_id', authenticateToken, (req, res) => {
    const goalId = req.params.goal_id;
    const userId = req.user.userId;

    const sqlDelete = 'DELETE FROM goals WHERE goal_id = ? AND user_id = ?';
    db.run(sqlDelete, [goalId, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error deleting goal: ' + err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Goal not found or not owned by the user.' });
        }

        res.status(200).json({ message: 'Goal deleted successfully.' });
    });
});

module.exports = router;

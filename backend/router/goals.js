const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('../database.db');

// Helper function to validate ISO date format
const isValidISODate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString() === dateString;
};

// Helper function to validate goal data
const validateGoalData = ({ goal_name, goal_deadline, target_distance, user_id, activity_id }) => {
    if (!goal_name || typeof goal_name !== 'string') {
        return 'Goal name is required and must be a string.';
    }
    if (!goal_deadline || !isValidISODate(goal_deadline)) {
        return 'Goal deadline is required and must be in ISO format (e.g., 2024-12-31T23:59:59.999Z).';
    }
    if (!target_distance || isNaN(target_distance) || target_distance <= 0) {
        return 'Target distance is required and must be a positive number.';
    }
    if (!user_id || isNaN(user_id) || user_id <= 0) {
        return 'User ID is required and must be a positive number.';
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
            g.user_id, 
            g.activity_id,
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

// Get all goals for a specific user with updated progress
router.get('/', (req, res) => {
    const userId = req.query.user_id;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required to view goals.' });
    }

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

        // Update progress for each goal
        const updatedGoals = await Promise.all(
            rows.map(async (goal) => {
                return new Promise((resolve, reject) => {
                    calculateProgress(goal.goal_id, (err, progress) => {
                        if (err) {
                            reject(err);
                        } else {
                            goal.progress = parseFloat(progress) || 0; // Ensure progress is numeric
                            resolve(goal);
                        }
                    });
                });
            })
        );

        res.status(200).json(updatedGoals);
    });
});

// Create a new goal for a user
router.post('/', (req, res) => {
    const { goal_name, goal_deadline, target_distance, user_id, activity_id } = req.body;

    // Validate input data
    const validationError = validateGoalData({ goal_name, goal_deadline, target_distance, user_id, activity_id });
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const sqlInsert = `
        INSERT INTO goals (goal_name, goal_deadline, target_distance, progress, user_id, activity_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sqlInsert, [goal_name, goal_deadline, target_distance, 0, user_id, activity_id], function(err) {
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

                    newGoal.progress = parseFloat(newGoal.progress) || 0; // Ensure progress is numeric
                    res.status(201).json(newGoal);
                });
            });
        });
    });
});

// Update a goal with datetime for deadline
router.put('/:goal_id', (req, res) => {
    const goalId = req.params.goal_id;
    const { goal_name, goal_deadline, target_distance, user_id, activity_id } = req.body;

    // Validate input data
    const validationError = validateGoalData({ goal_name, goal_deadline, target_distance, user_id, activity_id });
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    // Check if the goal exists for the user
    db.get('SELECT * FROM goals WHERE goal_id = ? AND user_id = ?', [goalId, user_id], (err, goal) => {
        if (err) {
            console.error('Error checking goal existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found or not owned by the user.' });
        }

        // Update the goal
        const sqlUpdate = `
            UPDATE goals 
            SET goal_name = ?, goal_deadline = ?, target_distance = ?, activity_id = ?
            WHERE goal_id = ? AND user_id = ?
        `;

        db.run(sqlUpdate, [goal_name, goal_deadline, target_distance, activity_id, goalId, user_id], function(err) {
            if (err) {
                console.error('Error updating goal:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Recalculate progress after the update
            calculateProgress(goalId, (err, progress) => {
                if (err) {
                    console.error('Error recalculating progress:', err);
                    return res.status(500).json({ error: 'Error recalculating progress' });
                }

                const sqlProgressUpdate = `UPDATE goals SET progress = ? WHERE goal_id = ?`;
                db.run(sqlProgressUpdate, [progress, goalId], (err) => {
                    if (err) {
                        console.error('Error updating progress:', err);
                        return res.status(500).json({ error: 'Error updating progress' });
                    }

                    // Respond with the updated goal
                    db.get('SELECT * FROM goals WHERE goal_id = ?', [goalId], (err, updatedGoal) => {
                        if (err) {
                            console.error('Error retrieving updated goal:', err);
                            return res.status(500).json({ error: 'Error retrieving updated goal' });
                        }

                        updatedGoal.progress = parseFloat(updatedGoal.progress) || 0; // Ensure progress is numeric
                        res.status(200).json(updatedGoal);
                    });
                });
            });
        });
    });
});

// Delete a goal for a user
router.delete('/:goal_id', (req, res) => {
    const goalId = req.params.goal_id;
    const userId = req.query.user_id; // Assuming user ID is sent as a query parameter

    // Validate the inputs
    if (!goalId || !userId) {
        return res.status(400).json({ error: 'Goal ID and User ID are required to delete a goal.' });
    }

    // Check if the goal exists for the user
    db.get('SELECT * FROM goals WHERE goal_id = ? AND user_id = ?', [goalId, userId], (err, goal) => {
        if (err) {
            console.error('Error checking goal existence:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found or not owned by the user.' });
        }

        // Proceed to delete the goal
        const sqlDelete = 'DELETE FROM goals WHERE goal_id = ? AND user_id = ?';
        db.run(sqlDelete, [goalId, userId], function(err) {
            if (err) {
                console.error('Error deleting goal:', err);
                return res.status(500).json({ error: 'Error deleting goal: ' + err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Goal not found or already deleted.' });
            }

            res.status(200).json({ message: 'Goal deleted successfully.' });
        });
    });
});

module.exports = router;
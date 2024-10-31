const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('C:/Users/Yuan/Documents/GitHub/TIC2601_II/backend/database/database3.db');

// Get all goals
router.get('/', (req, res) => {
    db.all('SELECT * FROM goals', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// Get a specific goal by ID
router.get('/:goal_id', (req, res) => {
    const goalId = req.params.goal_id;
    db.get('SELECT * FROM goals WHERE goal_id = ?', [goalId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.status(200).json(row);
        } else {
            res.status(404).json({ error: 'Goal not found.' });
        }
    });
});

// Create a new goal
router.post('/', (req, res) => {
    const { goal_name, goal_deadline, user_id, activity_id } = req.body;

    // Validate required fields
    if (!goal_name || !goal_deadline || !user_id || !activity_id) {
        return res.status(400).json({ error: 'Goal name, deadline, user ID, and activity type are required.' });
    }

    const progress = 0.0;

    // Insert the new goal
    const sqlInsert = `
        INSERT INTO goals (goal_name, goal_deadline, progress, user_id, activity_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.run(sqlInsert, [goal_name, goal_deadline, progress, user_id, activity_id], function(err) {
        if (err) {
            console.error('Error inserting goal:', err);
            return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
        }

        const newGoalId = this.lastID;
        db.get(`SELECT * FROM goals WHERE goal_id = ?`, [newGoalId], (err, newGoal) => {
            if (err) {
                console.error('Error retrieving new goal:', err);
                return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
            }
            res.status(201).json(newGoal);
        });
    });
});

// Update goal progress based on activity logs
router.put('/progress/:goal_id', (req, res) => {
    const goalId = req.params.goal_id;

    // Retrieve the goal to check goal target and activity_id
    db.get('SELECT * FROM goals WHERE goal_id = ?', [goalId], (err, goal) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found.' });
        }

        // Calculate progress based on activity logs
        const sql = `
            SELECT SUM(distance) as total_distance FROM activity_log 
            WHERE user_id = ? AND activity_id = ?
        `;
        db.get(sql, [goal.user_id, goal.activity_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const totalDistance = result.total_distance || 0;
            const targetDistance = parseFloat(goal.goal_name.match(/\d+(\.\d+)?/)[0]); // Extract target number from goal name
            const newProgress = Math.min((totalDistance / targetDistance) * 100, 100).toFixed(2);

            // Update goal progress
            const updateSql = `UPDATE goals SET progress = ? WHERE goal_id = ?`;
            db.run(updateSql, [newProgress, goalId], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(200).json({ goal_id: goalId, progress: newProgress });
            });
        });
    });
});

module.exports = router;
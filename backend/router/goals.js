const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./database/database.db');

// Get all goals for a specific user with progress included
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

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// Create a new goal for a user with datetime for deadline
router.post('/', (req, res) => {
    const { goal_name, goal_deadline, target_distance, user_id, activity_id } = req.body;

    if (!goal_name || !goal_deadline || !target_distance || !user_id || !activity_id) {
        return res.status(400).json({ error: 'Goal name, deadline, target distance, user ID, and activity type are required.' });
    }

    const progress = 0.0;

    const sqlInsert = `
        INSERT INTO goals (goal_name, goal_deadline, target_distance, progress, user_id, activity_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sqlInsert, [goal_name, goal_deadline, target_distance, progress, user_id, activity_id], function(err) {
        if (err) {
            console.error('Error inserting goal:', err);
            return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
        }

        const newGoalId = this.lastID;
        db.get('SELECT * FROM goals WHERE goal_id = ?', [newGoalId], (err, newGoal) => {
            if (err) {
                console.error('Error retrieving new goal:', err);
                return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
            }
            res.status(201).json(newGoal);
        });
    });
});

// Update a goal with datetime for deadline
router.put('/:goal_id', (req, res) => {
    const goalId = req.params.goal_id;
    const { goal_name, goal_deadline, target_distance, user_id, activity_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    db.get('SELECT * FROM goals WHERE goal_id = ? AND user_id = ?', [goalId, user_id], (err, goal) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found or not owned by the user.' });
        }

        const sqlUpdate = `
            UPDATE goals SET goal_name = ?, goal_deadline = ?, target_distance = ?, activity_id = ?
            WHERE goal_id = ? AND user_id = ?
        `;

        db.run(sqlUpdate, [goal_name, goal_deadline, target_distance, activity_id, goalId, user_id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Goal updated successfully.' });
        });
    });
});

// Delete a goal for a user
router.delete('/:goal_id', (req, res) => {
    const goalId = req.params.goal_id;
    const userId = req.query.user_id;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    db.get('SELECT * FROM goals WHERE goal_id = ? AND user_id = ?', [goalId, userId], (err, goal) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found or not owned by the user.' });
        }

        db.run('DELETE FROM goals WHERE goal_id = ? AND user_id = ?', [goalId, userId], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error deleting goal: ' + err.message });
            }
            res.status(200).json({ message: 'Goal deleted successfully.' });
        });
    });
});

module.exports = router;
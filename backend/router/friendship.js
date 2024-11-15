const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const authenticateToken = require('../authenticateToken'); // Import middleware

const db = new sqlite3.Database(path.join(__dirname, '../database.db'), (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
        process.exit(1);
    } else {
        console.log('Connected to the database.');
    }
});

console.log('Friend route loaded');
router.use(authenticateToken);

// SEARCH FOR USER BY EMAIL TO SEND FRIEND REQUEST
router.get('/search', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'A valid email is required.' });

    const query = 'SELECT user_id, first_name, last_name FROM user_registration WHERE email = ?';
    db.get(query, [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'No user found with this email.' });
        res.status(200).json(user);
    });
});


// SEND FRIENDSHIP REQUEST
router.post('/request', (req, res) => {
    const responder_id = String(req.body.responder_id);
    const requester_id = String(req.user.userId);
    if (!responder_id || requester_id === responder_id) return res.status(400).json({ error: 'Invalid friend request.' });

    const checkQuery = `
        SELECT * FROM friendship 
        WHERE (requester_id = ? AND responder_id = ?) OR (requester_id = ? AND responder_id = ?)
        AND (status = 'Pending' OR status = 'Accepted')
    `;
    db.get(checkQuery, [requester_id, responder_id, responder_id, requester_id], (err, existingRelationship) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existingRelationship) {
            const message = existingRelationship.status === 'Pending'
                ? 'Request already pending.'
                : 'You are already friends with this user.';
            return res.status(400).json({ error: message });
        }

        // Insert the friend request as pending if no relationship exists
        const insertQuery = `INSERT INTO friendship (requester_id, responder_id, status) VALUES (?, ?, 'Pending')`;
        db.run(insertQuery, [requester_id, responder_id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Friend request sent.', friendship_id: this.lastID });
        });
    });
});


// ACCEPT FRIEND REQUEST
router.post('/accept', (req, res) => {
    const { requester_id } = req.body; 
    const responder_id = req.user.userId; 

    console.log('Requester ID:', requester_id);
    console.log('Responder ID:', responder_id);

    // Update status to 'Accepted'
    const query = `
        UPDATE friendship
        SET status = 'Accepted'
        WHERE requester_id = ? AND responder_id = ? AND status = 'Pending'
    `;

    db.run(query, [requester_id, responder_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'No pending request found.' });

        res.status(200).json({ message: 'Friend request accepted and you are friends now.' });
    });
});


// REJECT FRIEND REQUEST
router.post('/reject', (req, res) => {
    const { requester_id } = req.body; 
    const responder_id = req.user.userId; 

    console.log('Requester ID:', requester_id);
    console.log('Responder ID:', responder_id);

    // Update status to 'Rejected'
    const query = `
        UPDATE friendship
        SET status = 'Rejected'
        WHERE requester_id = ? AND responder_id = ? AND status = 'Pending'
    `;

    db.run(query, [requester_id, responder_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'No pending request found.' });

        res.status(200).json({ message: 'Friend request rejected.' });
    });
});


// BREAK FRIENDSHIP
router.post('/break', (req, res) => {
    const { friend_id } = req.body; 
    const user_id = req.user.userId;

    // Delete the friendship record
    const query = `
        DELETE FROM friendship
        WHERE (requester_id = ? AND responder_id = ?) OR (requester_id = ? AND responder_id = ?)
    `;

    db.run(query, [user_id, friend_id, friend_id, user_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'No friendship found.' });

        return res.status(204).send();
    });
});


// RETRIEVE FRIEND AVATAR
router.get('/friend/avatar', (req, res) => {
    const { user_id } = req.query;

    if (!user_id) return res.status(400).json({ error: 'User ID is required' });

    const avatarPath = path.join(__dirname, `../user_uploads/${user_id}.png`);
    if (fs.existsSync(avatarPath)) {
        res.status(200).json({ avatarUrl: `/user_uploads/${user_id}.png` });
    } else {
        res.status(200).json({ avatarUrl: '/user_uploads/default.png' });
    }
});


// RETRIEVE CONFIRMED & PENDING FRIEND LIST
router.get('/list', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10, search = '', sort = 'first_name' } = req.query;
        const offset = (page - 1) * limit;

        // Only allow certain columns for sorting to prevent SQL injection
        const allowedSortFields = ['first_name', 'last_name'];
        const sortField = allowedSortFields.includes(sort) ? sort : 'first_name';

        // Count total records that match the search term
        const countPendingQuery = `
            SELECT COUNT(*) AS count 
            FROM friendship 
            INNER JOIN user_registration 
            ON friendship.requester_id = user_registration.user_id
            WHERE responder_id = ? AND status = 'Pending'
            AND (first_name LIKE ? OR last_name LIKE ?)
        `;
        
        const countFriendsQuery = `
            SELECT COUNT(*) AS count 
            FROM friendship 
            INNER JOIN user_registration 
            ON (user_registration.user_id = requester_id AND responder_id = ?) 
                OR (user_registration.user_id = responder_id AND requester_id = ?)
            WHERE status = 'Accepted'
            AND (first_name LIKE ? OR last_name LIKE ?)
        `;

        // Data retrieval queries with pagination
        const pendingQuery = `
            SELECT friendship_id, requester_id, responder_id, first_name, last_name, 'Pending' AS status
            FROM friendship 
            INNER JOIN user_registration ON friendship.requester_id = user_registration.user_id
            WHERE responder_id = ? AND status = 'Pending'
            AND (first_name LIKE ? OR last_name LIKE ?)
            ORDER BY ${sortField}                              
            LIMIT ? OFFSET ?                              
        `;

        const friendsQuery = `
            SELECT 
                CASE 
                    WHEN requester_id = ? THEN responder_id
                    ELSE requester_id 
                END AS friend_id, 
                first_name, last_name, 'Accepted' AS status
            FROM friendship 
            INNER JOIN user_registration 
            ON (user_registration.user_id = requester_id AND responder_id = ?) 
                OR (user_registration.user_id = responder_id AND requester_id = ?)
            WHERE status = 'Accepted'
            AND (first_name LIKE ? OR last_name LIKE ?)
            ORDER BY ${sortField}
            LIMIT ? OFFSET ?
        `;

        // Get total record count for filtered results
        const pendingCountResult = await new Promise((resolve, reject) => {
            db.get(countPendingQuery, [userId, `%${search}%`, `%${search}%`], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        const friendsCountResult = await new Promise((resolve, reject) => {
            db.get(countFriendsQuery, [userId, userId, `%${search}%`, `%${search}%`], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        // Get paginated data for current page
        const pendingRequests = await new Promise((resolve, reject) => {
            db.all(pendingQuery, [userId, `%${search}%`, `%${search}%`, limit, offset], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const friends = await new Promise((resolve, reject) => {
            db.all(friendsQuery, [userId, userId, userId, `%${search}%`, `%${search}%`, limit, offset], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Calculate total pages based on the filtered counts
        res.status(200).json({
            pendingRequests,
            friends,
            pendingTotalPages: Math.ceil(pendingCountResult.count / limit),
            friendTotalPages: Math.ceil(friendsCountResult.count / limit),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;

const express = require('express')
const router = express.Router();
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db/user_friendship.db', (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
        process.exit(1);
    } else {
        console.log('Connected to the user_friendship database.');
    }
});

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.loggedin) {
        return next(); // User is authenticated, proceed to the next route
    } else {
        return res.status(401).json({ error: 'You must be logged in to access this page' });
    }
};

router.use(isAuthenticated);


// SEARCH FOR USER BY EMAIL IN ORDER TO SEND FRIEND REQUEST
// In Postman: http://localhost:3000/friendship/search?email=<user_email>
// (replace <user_email> with the actual email you're searching for)

router.get('/search', (req, res) => {
    const { email } = req.query;    // search for another use by email

    if (!email) {
        return res.status(400).json({ error: 'A valid email is required.' });
    }

    const query = 'SELECT user_id, first_name, last_name FROM user_registration WHERE email = ?';

    db.get(query, [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'No user found with this email.' });
        }
        res.json(user);
    });
});


// SEND FRIENDSHIP REQUEST
router.post('/request', (req, res) => {
    const responder_id = String(req.body.responder_id);
    const requester_id = String(req.session.userID);    // Use the user ID from the session as the requester_id
    
    console.log('Requester ID:', requester_id);
    console.log('Responder ID:', responder_id);

    if (!responder_id) {
        return res.status(400).json({ error: 'Responder id is required.' });
    }
        
    if (requester_id === responder_id) {
            return res.status(400).json({ error: 'You cannot send a friendship request to yourself.' });
    }

    const query = `
        INSERT INTO friendship (requester_id, responder_id, status)
        VALUES (?, ?, 'Pending')
    `;

    // Check for existing pending friendship request
    const checkQuery = `
        SELECT * FROM friendship 
        WHERE (requester_id = ? AND responder_id = ?) OR (requester_id = ? AND responder_id = ?)
        AND status = 'Pending'
    `;

    db.get(checkQuery, [requester_id, responder_id, responder_id, requester_id], (err, existingRequest) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (existingRequest) {
            return res.status(400).json({ error: 'Friend request already pending.' });
        }

        // Insert new friendship request
        const query = `
            INSERT INTO friendship (requester_id, responder_id, status)
            VALUES (?, ?, 'Pending')
        `;

        db.run(query, [requester_id, responder_id], function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(400).json({ error: 'Friend request already exists.' });
                }
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({ message: 'Friend request sent successfully.', friendship_id: this.lastID });
        });
    });
});


// WITHDRAW FRIENDSHIP REQUEST
router.post('/withdraw', (req, res) => {
    const { responder_id } = req.body; 
    const requester_id = req.session.userID; 

    // Delete the pending friend request
    const query = `
        DELETE FROM friendship
        WHERE requester_id = ? AND responder_id = ? AND status = 'Pending'
    `;

    db.run(query, [requester_id, responder_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'No pending request found.' });

        res.json({ message: 'Friend request withdrawn.' });
    });
});


// ACCEPTS FRIEND REQUEST
router.post('/accept', (req, res) => {
    const { requester_id } = req.body; 
    const responder_id = req.session.userID; 

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

        res.json({ message: 'Friend request accepted and you are friends now.' });
    });
});


// REJECT FRIEND REQUEST
router.post('/reject', (req, res) => {
    const { requester_id } = req.body; 
    const responder_id = req.session.userID; 

    console.log('Requester ID:', requester_id);
    console.log('Responder ID:', responder_id);

    // Update status to 'rejected'
    const query = `
        UPDATE friendship
        SET status = 'Rejected'
        WHERE requester_id = ? AND responder_id = ? AND status = 'Pending'
    `;

    db.run(query, [requester_id, responder_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'No pending request found.' });

        res.json({ message: 'Friend request rejected.' });
    });
});


// BREAK FRIENDSHIP
router.post('/break', (req, res) => {
    const { friend_id } = req.body; 
    const user_id = req.session.userID;

    // Delete the friendship record
    const query = `
        DELETE FROM friendship
        WHERE (requester_id = ? AND responder_id = ?) OR (requester_id = ? AND responder_id = ?)
    `;

    db.run(query, [user_id, friend_id, friend_id, user_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'No friendship found.' });

        res.json({ message: 'Not friends anymore.' });
    });
});

module.exports = router;
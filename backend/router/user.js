const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken'); 

const authenticateToken = require('../authenticateToken'); // Import the middleware
const secretKey = 'super_secret_key_for_TIC2601!'; 

const upload = multer({
    dest: path.join(__dirname, '../user_uploads/'), //  Destination folder to store user photo
    limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only .png files are allowed!'), false);
        }
    },
});

const db = new sqlite3.Database(path.join(__dirname, '../database.db'), (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
        process.exit(1);
    } else {
        console.log('user connected to the database.');
    }
});

console.log('User route loaded');


// NEW USER REGISTRATION ROUTE
router.post('/register', (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const regQuery = `
        INSERT INTO user_registration (first_name, last_name, email, password)
        VALUES (?, ?, ?, ?)`;

    db.run(regQuery, [first_name, last_name, email, password], function (err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).json({ error: 'Account already exists, please sign in' });
            }
            return res.status(400).json({ error: err.message });
        }
        const userId = this.lastID;
        res.status(201).json({ user_id: userId });
    });
});


// USER LOGIN ROUTE
router.post('/auth', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const query = 'SELECT * FROM user_registration WHERE email = ?';
    db.get(query, [email], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error occurred.' });
        if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid email or password.' });

        // Generate the token
        const token = jwt.sign({ userId: user.user_id, email: user.email }, secretKey, { expiresIn: '1h' });
        console.log('Generated Token:', token); // Log the token to verify it’s created

        res.status(200).json({
            message: 'Login successful!',
            accessToken: token,
            user_id: user.user_id
        });
    });
});



// VIEW USER PROFILE ROUTE
router.get('/profile', authenticateToken, (req, res) => {
    const query = `
        SELECT first_name, last_name, email, dob, gender, height, weight, nationality
        FROM user_registration
        LEFT JOIN user_profile ON user_registration.user_id = user_profile.user_id
        WHERE user_registration.user_id = ?
    `;
    
    db.get(query, [req.user.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(user || { error: 'Profile not found' });
    });
});


// UPDATE OR CREATE PROFILE ROUTE
router.put('/update-profile', authenticateToken, (req, res) => {
    const userID = req.user.userId;
    const { first_name, last_name, dob, gender, nationality, height, weight } = req.body;
    let updated = false;

    // Server-side validation to check for missing or empty fields
    if (!first_name || !last_name || !dob || !gender || !nationality || !height || !weight) {
        return res.status(400).json({ error: 'All fields are required and cannot be empty.' });
    }

    const runQuery = (query, values) => 
        new Promise((resolve, reject) => {
            db.run(query, values, function (err) {
                if (err) return reject(err);
                updated = true;
                resolve();
            });
        });

    const checkProfileQuery = `SELECT * FROM user_profile WHERE user_id = ?`;
    db.get(checkProfileQuery, [userID], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        const updateQueries = [];

        if (first_name || last_name) {
            const regFields = [];
            const regValues = [];

            if (first_name) regFields.push("first_name = ?"), regValues.push(first_name);
            if (last_name) regFields.push("last_name = ?"), regValues.push(last_name);

            if (regFields.length > 0) {
                const regQuery = `UPDATE user_registration SET ${regFields.join(', ')} WHERE user_id = ?`;
                regValues.push(userID);
                updateQueries.push(runQuery(regQuery, regValues));
            }
        }

        if (row) {
            const profFields = [];
            const profValues = [];

            if (dob) profFields.push("dob = ?"), profValues.push(dob);
            if (gender) profFields.push("gender = ?"), profValues.push(gender);
            if (nationality) profFields.push("nationality = ?"), profValues.push(nationality);
            if (height) profFields.push("height = ?"), profValues.push(height);
            if (weight) profFields.push("weight = ?"), profValues.push(weight);

            if (profFields.length > 0) {
                const profQuery = `UPDATE user_profile SET ${profFields.join(', ')} WHERE user_id = ?`;
                profValues.push(userID);
                updateQueries.push(runQuery(profQuery, profValues));
            }
        } else {
            const insertQuery = `
                INSERT INTO user_profile (user_id, dob, gender, nationality, height, weight)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const insertValues = [userID, dob, gender, nationality, height, weight];
            updateQueries.push(runQuery(insertQuery, insertValues));
        }

        Promise.all(updateQueries)
            .then(() => {
                updated
                    ? res.status(200).json({ message: 'Profile updated successfully' })
                    : res.status(400).json({ error: 'No valid fields to update' });
            })
            .catch((err) => {
                // Check if the error is due to constraint violation
                if (err.message.includes("SQLITE_CONSTRAINT: CHECK constraint failed")) {
                    return res.status(400).json({
                        error: "Invalid values: Height and Weight must be positive numbers."
                    });
                }
                res.status(500).json({ error: err.message });
            });
    });
});


// UPDATE PASSWORD
router.put('/update-password', authenticateToken, (req, res) => {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'Enter password twice.' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const query = `UPDATE user_registration SET password = ? WHERE user_id = ?`;
    db.run(query, [newPassword, req.user.userId], function (err) {
        if (err) return res.status(500).json({ error: 'An error occurred while updating the password' });
        res.status(200).json({ message: 'Password updated successfully' });
    });
});


// PROFILE PHOTO UPLOAD ROUTE
router.post('/upload-avatar', authenticateToken, upload.single('avatar'), (req, res) => {
    const userId = req.user.userId;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../user_uploads/${userId}.png`);

    if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
    }

    fs.rename(tempPath, targetPath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error processing file upload.' });
        }
        res.status(200).json({ message: 'Profile photo uploaded successfully.' });
    });
});


// LOGOUT ROUTE
router.post('/logout', (req, res) => {
    res.status(204).send();
});

module.exports = router;

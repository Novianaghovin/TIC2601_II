const express = require('express')
const router = express.Router();
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db/user_friendship.db', (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
        process.exit(1);    // Exit the process if db cannot be opened
    } else {
        console.log('Connected to the user_friendship database.');
    }
});


// NEW USER REGISTRATION ROUTE
router.post('/register', (req, res) => {
    const { first_name, last_name, email, password, dob, gender, height, weight, nationality } = req.body;
    // console.log('Received request to /register:', req.body);

    if (!first_name || !last_name || !email || !password || !dob || !gender || !height || !weight || !nationality) {
        console.log('Missing fields');
        return res.status(400).json({ error: 'Missing fields' });
    }

    const regQuery = `
        INSERT INTO user_registration (first_name, last_name, email, password)
        VALUES (?, ?, ?, ?)`;

    db.run(regQuery, [first_name, last_name, email, password], function (err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).json({ error: 'Account already exists' });
            }
            return res.status(400).json({ error: err.message });
        }
        // After successful registration, get the user_id from the result
        const userId = this.lastID;

        // Insert profile into user_profile
        const profileQuery = `
            INSERT INTO user_profile (user_id, dob, gender, height, weight, nationality)
            VALUES (?, ?, ?, ?, ?, ?)`;

        db.run(profileQuery, [userId, dob, gender, height, weight, nationality], function (err) {
            if (err) {  // Rollback if there is an error inserting into user_profile
                return res.status(400).json({ error: err.message });
            }
    
            res.json({ user_id: userId });
        });
    });
});



// USER LOGIN ROUTE
router.post('/auth', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const query = 'SELECT * FROM user_registration WHERE email = ? AND password = ?';

    db.get(query, [email, password], (err, user) => {
        if (err) {
            // console.log('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: 'Email does not exist. Please sign up.' });
        }

        req.session.loggedin = true;
        req.session.userID = user.user_id;
        req.session.userEmail = user.email;
        res.json({ message: 'Login successful!' });
    });
});



// VIEW USER PROFILE ROUTE
router.get('/profile', (req, res) => {
    if (!req.session.loggedin) {
        return res.status(401).json({ error: 'You must be logged in to view this page.' });
    }

    // SQL query to fetch user registration and profile details
    const query = `
        SELECT user_registration.first_name, user_registration.last_name, user_registration.email, 
               user_profile.dob, user_profile.gender, user_profile.height, user_profile.weight, user_profile.nationality
        FROM user_registration
        JOIN user_profile ON user_registration.user_id = user_profile.user_id
        WHERE user_registration.user_id = ?
    `;
    
    db.get(query, [req.session.userID], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(user);
    });
});


// LOGOUT ROUTE
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Logged out successfully.' });
    });
});

module.exports = router;

/* Note: USER ROUTING REQUIRES THE FOLLOWING TO BE INCLUDED IN APP/SERVER.JS
 
const express = require('express')
const app = express();
const sqlite3 = require('sqlite3').verbose()
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')

app.use(express.json())
const port = 3000

app.use(bodyParser.json())
app.use(cors())
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const user = require('./user') // Import the user routes

// Mount user routes at the `/user` endpoint
app.use('/user', user)

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, function () {
    console.log(`Express app listening on port ${port}!`)
});
 */
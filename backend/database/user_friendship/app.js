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
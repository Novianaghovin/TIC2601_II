const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

const corsOptions = {
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true, // Allow cookies and credentials to be included
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/user_uploads', express.static(path.join(__dirname, 'user_uploads')));

const user = require('./router/user');
const friend = require('./router/friend');
const badge = require('./router/badge');

app.use('/user', user);
app.use('/friend', friend);
app.use('/badge', badge);

const port = 3001;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

module.exports = { app };
const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true, // Allow cookies and credentials to be included
};

app.use(cors(corsOptions));
app.use(express.json());

const user = require('./routes/user');
const friend = require('./routes/friend');

app.use('/user', user);
app.use('/friend', friend);

const port = 3001;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

module.exports = { app };

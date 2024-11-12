// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const badgeRouter = require('./router/badge'); // Import the badgeRouter

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Use the badgeRouter for the /badge endpoint
// http://localhost:3000/badge this data can be display using postman
app.use(badgeRouter);

// Start the Express app on port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

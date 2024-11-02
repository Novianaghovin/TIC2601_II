const express = require('express'); 
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Import the activity type router
const activityType = require('./activity_type'); 
app.use('/activity_type', activityType);

// Import the activity log router
const activityLog = require('./activity_log');
app.use('/activity_log', activityLog); // Use the activity log router

// Import the goals router
const goals = require('./goals');
app.use('/goals', goals); // Use the goals router

// Start the Express server
app.listen(port, function () {
    console.log(`Express app listening on port ${port}!`);
});
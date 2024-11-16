const express = require('express'); 
const cors = require('cors'); 
const app = express();
const port = 3000;

// Enable CORS for cross-origin requests
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Import the activity type router and set a base path
const activityType = require('./router/activity_type'); 
app.use('/api/activity_type', activityType);

// Import the activity log router and set a base path
const activityLog = require('./router/activity_log');
app.use('/api/activity_log', activityLog);

// Import the goals router and set a base path
const goals = require('./router/goals');
app.use('/api/goals', goals);

// Start the Express server
app.listen(port, function () {
    console.log(`Express app listening on http://localhost:${port}`);
});
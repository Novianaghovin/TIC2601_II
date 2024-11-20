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
const friend = require('./router/friends');
const activityType = require('./router/activity_type');
const activityLog = require('./router/activity_log');
const goals = require('./router/goals');
const Challenges = require('./router/challenges');
const Leaderboard = require('./router/leaderboard');
const badge = require('./router/badgeYearly');
const watcher = require('./router/watcher_leaderboard');

app.use('/user', user);
app.use('/friends', friend);
app.use('/api/activity_type', activityType);
app.use('/api/activity_log', activityLog);
app.use('/api/goals', goals);
app.use('/api/challenges', Challenges);
app.use('/api/leaderboard', Leaderboard);
app.use('/api', badge);

// Start the database watcher
watcher.startDatabaseWatcher();

/*
// Schedule to run on the 1st day of every month at 00:00
cron.schedule('0 0 1 * *', () => {
    console.log('Running monthly rank update...');
    updateRanks();
});
*/

const port = 3001;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

module.exports = { app };

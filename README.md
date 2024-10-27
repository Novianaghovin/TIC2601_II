GUIDE TO VIEW MY CHALLENGES WEB UI
-
**TWO METHODS**
1) On your terminal type >**git status** -> check which branch are u on, if its not my branch , then use **git checkout For-yk-test** to move to my branch
2) Download my code and just follow step 3 - 5 


3) Open up 2 terminals tab side by side preferably, 
one of the terminal you type **>cd public** 
the other terminal you type **>cd my-app**

4) For the 'public' terminal, you type >**node server.js** to start the backend service
5) For the 'my-app' terminal, you type >**npm start** to start the react js service -> it will open up the challenges web UI automatically


LOGS 
-
UPDATES AS OF 26 OCTOBER 2024:
1) Have built the challenge web UI using react.js to display the top navigation bar, 
My Challenges with the leaderboard button and Available Challenges with the Join button.

2) Available Challenges table can be populated now via API to the backend server where it sends SQL query to our DB to fetch the data
   However, the Join button feature is not available yet.

3) My Challenges will not be populated yet as it requires integration with the other tables.

4) The top navigation bar have all the buttons required but the feature is not available yet as well.

5) All data within the available challenges table are using generated sample data

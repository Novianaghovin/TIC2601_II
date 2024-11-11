import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Challenges from './controller/challenge.js'; 
import Leaderboard from './controller/leaderboard.js';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          {/* Route for Challenges component */}
          <Route path="/" element={<Challenges />} />
          
          {/* Route for Leaderboard component with a dynamic challengeId */}
          <Route path="/leaderboard/:challengeId" element={<Leaderboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

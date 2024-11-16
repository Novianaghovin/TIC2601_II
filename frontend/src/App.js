import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './Navbar'; // Import NavBar component
//import Badges from './controller/badges'; // Import the Badges component
//import Challenges from './controller/challenge'; // Import the Challenges component
import ActivityLog from './pages/ActivityLog';
import Goals from './pages/Goals';

const App = () => {
  return (
    <Router>
      <div className="page-container">
        <NavBar />  {/* Navigation Bar */}

        <Routes>
          {/* Route for the Badges page */}
          <Route path="/activities" element={<ActivityLog />} />
          <Route path="/goals" element={<Goals />} />

          {/* Default Route */}
          <Route path="/" element={<h1>Welcome to the Dashboard</h1>} />
        </Routes>
      </div>
    </Router>
  );
};

//<Route path="/badges" element={<Badges />} />
//<Route path="/challenges" element={<Challenges />} />
export default App;

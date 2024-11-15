import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './Navbar'; // Import NavBar component
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import WelcomePage from './components/Welcome/WelcomePage';
import FriendPage from './pages/FriendPage';
import Badges from './controller/badges'; // Import the Badges component
import Challenges from './controller/challenge'; // Import the Challenges component

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

const App = () => {
  return (
    <Router>
      <div className="page-container">
        <NavBar />  {/* Navigation Bar */}

        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/friend" element={<FriendPage />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/challenges" element={<Challenges />} />
          {/* Default Route */}
          {/* <Route path="/" element={<h1>Welcome to the Dashboard</h1>} /> */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;

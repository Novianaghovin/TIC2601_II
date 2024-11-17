import React from 'react';
import axios from 'axios';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import WelcomePage from './components/Welcome/WelcomePage';
import FriendPage from './pages/FriendPage';
import ActivityLog from './pages/ActivityLog';
import Goals from './pages/Goals';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

const App = () => {
  return (
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/friends" element={<FriendPage />} />
          <Route path="/activities" element={<ActivityLog />} />
          <Route path="/goals" element={<Goals />} />
          {/* <Route path="/badges" element={<Badges />} />
          <Route path="/challenges" element={<Challenges />} /> */}
          {/* Default Route */}
          {/* <Route path="/" element={<h1>Welcome to the Dashboard</h1>} /> */}
        </Routes>
  );
};

export default App;
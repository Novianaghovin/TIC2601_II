// Navbar.js

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';  // Import useNavigate for programmatic navigation
import './Navbar.css'; // Import the CSS file for styling

const NavBar = () => {
  const navigate = useNavigate();  // Use navigate to programmatically change routes

  const handleLogout = () => {
    // Implement your logout logic here, like clearing tokens or user data
    // For example, you might clear localStorage or sessionStorage
    localStorage.removeItem('userToken');  // Example: remove the user token from localStorage

    // Redirect to the login page or home page after logout
    navigate('/');  // Redirect to home page after logging out
  };

  return (
    <div className="navbar">
      <NavLink to="/" className="nav-button">Profile</NavLink>
      <NavLink to="/activities" className="nav-button">Activities</NavLink>
      <NavLink to="/goals" className="nav-button">Goals</NavLink>
      <NavLink to="/friends" className="nav-button">Friend List</NavLink>
      <NavLink to="/challenges" className="nav-button">Challenges</NavLink>
      <NavLink to="/badges" className="nav-button">Badges</NavLink>
      {/* Logout button */}
      <button className="nav-button logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default NavBar;

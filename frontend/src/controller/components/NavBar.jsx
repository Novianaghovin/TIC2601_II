import React from 'react';
import './NavBar.css';

const NavBar = () => {
  return (
    <div className="navbar">
      <button className="nav-button">Profile</button>
      <button className="nav-button">Activities</button>
      <button className="nav-button">Goals</button>
      <button className="nav-button">Friend List</button>
      <button className="nav-button active">Challenges</button>
      <button className="nav-button">Badges</button>
    </div>
  );
};

export default NavBar;


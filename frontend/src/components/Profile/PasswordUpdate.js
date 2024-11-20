import React, { useState } from "react";
import axios from 'axios';

const PasswordUpdateForm = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handlePasswordUpdate = () => {
    if (newPassword !== confirmPassword) {
      window.alert("Passwords do not match");
      return;
    }
  
    const token = localStorage.getItem('accessToken');
  
    axios.put('/user/update-password', { newPassword, confirmPassword }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Add JWT token to Authorization header
      },
      withCredentials: true
    })
    .then(response => {
      window.alert("Password updated successfully");
    })
    .catch(error => {
      window.alert("Error updating password");
      console.error("Error:", error);
    });
  };

  return (
    <div className="section">
      <h6 className="section-title">Update Password</h6>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <div className="password-container">
            <input
              type={passwordVisible ? "text" : "password"}
              className="form-control"
              id="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span
              className="toggle-icon"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? "🙈" : "👁️"}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-container">
            <input
              type={passwordVisible ? "text" : "password"}
              className="form-control"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="toggle-icon"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? "🙈" : "👁️"}
            </span>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" style={{ marginTop: "20px" }} onClick={handlePasswordUpdate}>
        UPDATE PASSWORD
      </button>
    </div>
  );
};

export default PasswordUpdateForm;

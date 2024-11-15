import React, { useEffect, useState } from 'react';
import axios from "axios";
import { FaCamera } from 'react-icons/fa';

const ProfileSideBar = ({ avatarUrl, setAvatarUrl }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    dob: '',
    gender: '',
  });
  const [error, setError] = useState(null);

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError("No user ID found. Please log in.");
      return;
    }

    // Set avatar URL to load only .png with cache-busting timestamp
    const avatarPath = `http://localhost:3001/user_uploads/${userId}.png?timestamp=${new Date().getTime()}`;
    setAvatarUrl(avatarPath);

    const token = localStorage.getItem('accessToken');
    axios.get('/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      setUserData({
        name: `${response.data.first_name} ${response.data.last_name}`,
        email: response.data.email,
        dob: response.data.dob,
        gender: response.data.gender,
      });
    })
    .catch(error => {
      console.error('Error fetching user profile:', error);
      setError(error.response?.data?.error || 'Failed to fetch user data');
    });
  }, [setAvatarUrl]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      // Upload the avatar as .png
      await axios.post("/user/upload-avatar", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update avatar URL with cache-busting timestamp
      const newAvatarUrl = `/user_uploads/${userId}.png?timestamp=${new Date().getTime()}`;
      setAvatarUrl(newAvatarUrl);
    } catch (error) {
      console.error("Failed to upload avatar:", error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="card">
      <div className="card-body user-profile">
        {error ? (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        ) : (
          <>
            <div className="avatar-container" style={{ position: "relative" }}>
              <img
                src={avatarUrl}
                alt={`${userData.name}'s avatar`}
                onError={(e) => { 
                  e.target.src = '/user_uploads/default.png'; // Default image if .png is missing
                }}
                className="avatar-image"
              />
              <label htmlFor="avatarInput" className="camera-icon">
                <FaCamera />
              </label>
              <input
                id="avatarInput"
                type="file"
                accept="image/png" // Accept only .png files
                onChange={handleAvatarUpload}
                style={{ display: "none" }} // Hidden file input
              />
            </div>
            <h5 className="user-name">{userData.name || 'Name not available'}</h5>
            <h6 className="user-email">{userData.email || 'Email not available'}</h6>
            <p>Gender: {userData.gender || 'Not specified'}</p>
            <p>Age: {calculateAge(userData.dob)}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileSideBar;

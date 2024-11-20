import React, { useEffect, useState } from "react";
import axios from "axios"; 
import UserProfileField from "./UserProfileField";
import ActionButtons from "./ActionButtons";

const UserProfileForm = () => {
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    dob: '',
    gender: '',
    nationality: '',
    height: '',
    weight: ''
  });
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    // Fetch user profile data from the backend on component mount
    axios.get('/user/profile', {
      withCredentials: true  // Include credentials for session cookies
    })
    .then(response => {
      const profileData = {
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email,
        gender: response.data.gender,
        nationality: response.data.nationality,
        dob: response.data.dob,
        height: response.data.height,
        weight: response.data.weight
      };
      setUserData(profileData);
      setOriginalData(profileData); // Store the original data for cancel functionality
    })
    .catch(error => {
      console.error('Error fetching user profile:', error);
      alert('Error fetching profile data. Please try again.');
    });
  }, []);

  const validateFields = () => {
    for (const key in userData) {
      if (!userData[key]) {
        alert(`Please fill in your ${key.replace('_', ' ')}`);
        return false;
      }
    }
    return true;
  };

  // Handle Update
  const handleUpdate = () => {
    if (!validateFields()) return; // Ensure all fields are validated before sending

    axios.put('/user/update-profile', userData, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true  // Include session cookies
    })
    .then(response => {
      alert(response.data.message); 
      setOriginalData(userData); 
    })
    .catch(error => {
      alert(`Error updating profile: ${error.response?.data?.error || 'Unknown error'}`);
    });
  };

  // Handle Cancel
  const handleCancel = () => {
    setUserData(originalData); // Revert to the original fetched data
  };

  return (
    <div className="section">
      <h6 className="section-title">Personal Information</h6>
      <UserProfileField userData={userData} setUserData={setUserData} />
      <ActionButtons onCancel={handleCancel} onUpdate={handleUpdate} />
    </div>
  );
};

export default UserProfileForm;

import React, { useState } from "react";
import axios from "axios";

const UploadForm = ({ setAvatarUrl }) => {
  const [uploadMessage, setUploadMessage] = useState("");
  const userId = localStorage.getItem("userId");

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("accessToken");

      if (!userId) {
        console.error("User ID not found in localStorage.");
        setUploadMessage("User ID not found. Please log in again.");
        return;
      }

      const response = await axios.post("/user/upload-avatar", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadMessage(response.data.message);

      const fileExtension = file.name.split('.').pop();
      const newAvatarUrl = `/user_uploads/${userId}.${fileExtension}?timestamp=${new Date().getTime()}`;
      
      setAvatarUrl(newAvatarUrl);  // Update parent avatar URL
    } catch (error) {
      setUploadMessage(error.response?.data?.error || "Failed to upload avatar.");
    }
  };

  return (
    <div className="upload-form">
      <input
        id="avatarInput"
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        style={{ display: "none" }}
      />
      <p>{uploadMessage}</p>
    </div>
  );
};

export default UploadForm;

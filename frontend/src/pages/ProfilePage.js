import React, { useState } from "react";
import ProfileSideBar from "../components/Profile/ProfileSideBar";
import UserProfileForm from "../components/Profile/UserProfileForm";
import PasswordUpdate from "../components/Profile/PasswordUpdate";
import NavBar from "../components/Shared/Navbar";
import "./profilepage.css";

const ProfilePage = () => {
  const [avatarUrl, setAvatarUrl] = useState(`/user_uploads/default.png?timestamp=${new Date().getTime()}`);

  return (
    <>
    <NavBar />  {/* Render the NavBar here */}
    <div className="profile-container">
      <div className="row">
        <div className="col-3">
          <ProfileSideBar avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl} />
        </div>
        <div className="col-9">
          <div className="card">
            <div className="card-body">
              <UserProfileForm />
              <PasswordUpdate />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfilePage;

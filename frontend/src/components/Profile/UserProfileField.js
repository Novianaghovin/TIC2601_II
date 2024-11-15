import React from 'react';
import Select from 'react-select';
import { getNames } from 'country-list';

const UserProfileField = ({ userData, setUserData }) => {
  const countryOptions = getNames().map((country) => ({
    value: country,
    label: country,
  })).sort((a, b) => a.label.localeCompare(b.label));

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Others', label: 'Others' }
  ];

  return (
    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="first_name">First Name</label>
        <input
          type="text"
          className="form-control"
          id="first_name"
          value={userData.first_name}
          onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="last_name">Last Name</label>
        <input
          type="text"
          className="form-control"
          id="last_name"
          value={userData.last_name}
          onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="gender">Gender</label>
        <Select
          options={genderOptions}
          value={genderOptions.find((option) => option.value === userData.gender)}
          onChange={(selectedOption) => setUserData({ ...userData, gender: selectedOption.value })}
          placeholder="Select your gender"
          id="gender"
          classNamePrefix="custom-select"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="nationality">Nationality</label>
        <Select
          options={countryOptions}
          value={countryOptions.find((option) => option.value === userData.nationality)}
          onChange={(selectedOption) => setUserData({ ...userData, nationality: selectedOption.value })}
          placeholder="Select your nationality"
          id="nationality"
          classNamePrefix="custom-select"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="dob">Date of Birth</label>
        <input
          type="date"
          className="form-control"
          id="dob"
          value={userData.dob}
          onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="height">Height (cm)</label>
        <input
          type="number"
          className="form-control"
          id="height"
          value={userData.height}
          onChange={(e) => setUserData({ ...userData, height: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="weight">Weight (kg)</label>
        <input
          type="number"
          className="form-control"
          id="weight"
          value={userData.weight}
          onChange={(e) => setUserData({ ...userData, weight: e.target.value })}
          required
        />
      </div>
    </div>
  );
};

export default UserProfileField;

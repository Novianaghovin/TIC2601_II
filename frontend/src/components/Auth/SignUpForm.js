import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUpForm = ({ togglePanel }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { first_name, last_name, email, password } = formData;
      const registrationResponse = await axios.post('/user/register', { first_name, last_name, email, password });  
      
      if (registrationResponse.data.user_id) {
        // Login to get token after successful registration
        const authResponse = await axios.post('/user/auth', { email, password });
        
        if (authResponse.data.accessToken) {
          // Store token in localStorage
          localStorage.setItem('accessToken', authResponse.data.accessToken);
          localStorage.setItem('userId', authResponse.data.user_id);
          
          alert('Account created successfully!');
          navigate('/profile'); // Redirect to profile page
        } else {
          setError('Unable to login after registration.');
        }
      } else {
        setError('Registration failed: ' + registrationResponse.data.error);  // Custom error from server
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error || 'An unexpected error occurred.');
      } else if (error.request) {
        setError('No response from server. Check your internet connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create Account</h1>
      {error && <span className="account-text">{error}</span>}
      <input 
        type="text" 
        name="first_name" 
        placeholder="First Name" 
        required 
        value={formData.first_name}
        onChange={handleChange}
      />
      <input 
        type="text" 
        name="last_name" 
        placeholder="Last Name" 
        required 
        value={formData.last_name}
        onChange={handleChange}
      />
      <input 
        type="email" 
        name="email" 
        placeholder="Email" 
        required 
        value={formData.email}
        onChange={handleChange}
      />
      <input 
        type="password" 
        name="password" 
        placeholder="Password" 
        required 
        value={formData.password}
        onChange={handleChange}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignUpForm;

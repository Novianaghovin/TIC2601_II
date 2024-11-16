import React, { useState } from 'react';
import axios from 'axios';

const SignInForm = ({ togglePanel, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    console.log('SignInForm handleSubmit started');

    try {
      const response = await axios.post('/user/auth', { email, password });
      
      console.log('Login response:', response);
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('userId', response.data.user_id);
        
        console.log('Token saved to localStorage:', response.data.accessToken);
        onLoginSuccess();   // Trigger callback for successful login
      } else {
        setError('Login failed: ' + response.data.error);  // Custom error from server
      }
    } catch (error) {
      console.log('Login error:', error);
      setError(error.response ? error.response.data.error : 'An unexpected error occurred.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign in</h1>
      {error && <span className="account-text">{error}</span>}
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
      />
      <button type="submit">Sign In</button>
    </form>
  );
};

export default SignInForm;

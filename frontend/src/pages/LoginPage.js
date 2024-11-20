import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInForm from '../components/Auth/SignInForm';
import SignUpForm from '../components/Auth/SignUpForm';
import '../components/Auth/auth.css';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const togglePanel = () => {
    setIsSignUp(!isSignUp);
  };

  const handleLoginSuccess = () => {
    navigate('/welcome');
  };

  return (
    <div className="login-body">
      <div className={`container ${isSignUp ? 'right-panel-active' : ''}`} id="container">
        <div className="form-container sign-up-container">
          <SignUpForm togglePanel={togglePanel} />
        </div>

        <div className="form-container sign-in-container">
          <SignInForm togglePanel={togglePanel} onLoginSuccess={handleLoginSuccess} />
        </div>
        
        {/* Overlay elements */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
            <h1 style={{ color: '#FFFFFF' }}>Welcome Back!</h1>
              <p>To keep connected with your fitness journey, please login with your personal info</p>
              <button className="ghost-button" onClick={togglePanel}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 style={{ color: '#FFFFFF' }}>Hello, Friend!</h1>
              <p>Enter your personal details and begin your fitness journey with us</p>
              <button className="ghost-button" onClick={togglePanel}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

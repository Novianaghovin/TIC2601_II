// src/UserForm.js JH WILL EDIT THIS
import React, { useState } from 'react';

const UserForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        dob: '',
        gender: '',
        height: '',
        weight: '',
        nationality: ''
    });
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const url = isLogin
            ? 'http://localhost:3000/login'
            : 'http://localhost:3000/signup';
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to authenticate user');
            const data = await response.json();
            setMessage(isLogin ? `Welcome, ${data.firstName}` : 'Signup successful');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="gender"
                            placeholder="Gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                        />
                        <input
                            type="number"
                            name="height"
                            placeholder="Height (cm)"
                            value={formData.height}
                            onChange={handleInputChange}
                        />
                        <input
                            type="number"
                            name="weight"
                            placeholder="Weight (kg)"
                            value={formData.weight}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="nationality"
                            placeholder="Nationality"
                            value={formData.nationality}
                            onChange={handleInputChange}
                        />
                    </>
                )}
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                />
                <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Create an Account' : 'Already have an account? Login'}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default UserForm;

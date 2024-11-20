import React, { useState } from 'react';
import axios from 'axios';

const SearchFriend = () => {
    const [email, setEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('/user_uploads/default.png'); // Default placeholder avatar

    const handleSearch = async () => {
        if (!email) {
            setMessage('A valid email is required.');
            setSearchResult(null);
            return;
        }
        try {
            // Search for user based on email
            const response = await axios.get(`/friends/search?email=${email}`);
            const userData = response.data;
            setSearchResult(userData);
            setMessage('');
            setShowModal(true);

            // Construct the avatar URL directly based on user_id
            const userId = userData.user_id;
            const avatarPath = `http://localhost:3001/user_uploads/${userId}.png`;
            setAvatarUrl(avatarPath); // Set the avatar URL directly
        } catch (error) {
            setSearchResult(null);
            setMessage(error.response?.data?.error || 'User not found');
            setAvatarUrl('/user_uploads/default.png'); // Reset to default on error
        }
    };

    const sendFriendRequest = async (userId) => {
        try {
            await axios.post('/friends/request', { responder_id: userId });
            setMessage('Friend request sent!');
            setShowModal(false); 
            setSearchResult(null);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Error sending request');
        }
    };

    return (
        <div className="search-section">
            <label htmlFor="email" style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>Find Friend</label>
            <input
                type="email"
                id="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSearch} className="search-button">Search</button>

            {message && (
                <div className="message-container">
                    {message}
                </div>
            )}

            {showModal && searchResult && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="avatar-container">
                            <img 
                                className="avatar" 
                                src={avatarUrl} // Display dynamic avatar URL
                                alt="User avatar"
                                onError={(e) => { e.target.src = '/user_uploads/default.png'; }} // Fallback to default if not found
                            />
                        </div>
                        <p>{searchResult.first_name} {searchResult.last_name} found.</p>
                        <button onClick={() => sendFriendRequest(searchResult.user_id)} className="modal-button">Send Friend Request</button>
                        <button onClick={() => setShowModal(false)} className="modal-button">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchFriend;

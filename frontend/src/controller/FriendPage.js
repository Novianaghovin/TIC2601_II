import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import SearchFriend from '../components/Friend/SearchFriend';
import PendingRequests from '../components/Friend/PendingRequests';
import FriendList from '../components/Friend/FriendList';
import './friendpage.css';

function FriendPage() {
    const [friendData, setFriendData] = useState({ pendingRequests: [], friends: [] });
    const [activeTab, setActiveTab] = useState('PendingRequest');
    const [pendingPage, setPendingPage] = useState(1);
    const [friendPage, setFriendPage] = useState(1);
    const [pendingTotalPages, setPendingTotalPages] = useState(1);
    const [friendTotalPages, setFriendTotalPages] = useState(1);
    const [friendSearchQuery, setFriendSearchQuery] = useState('');
    const [pendingSearchQuery, setPendingSearchQuery] = useState('');

    // Fetch friend data from backend with pagination and search
    const fetchFriendData = useCallback(async () => {
        try {
            const response = await axios.get('/friend/list', {
                params: {
                    page: activeTab === 'PendingRequest' ? pendingPage : friendPage,
                    limit: 10,
                    search: activeTab === 'PendingRequest' ? pendingSearchQuery : friendSearchQuery,
                },
            });

            const { pendingRequests, friends, pendingTotalPages, friendTotalPages } = response.data;

            setFriendData({
                pendingRequests,
                friends,
            });

            // Set total pages based on backend response
            setPendingTotalPages(pendingTotalPages); 
            setFriendTotalPages(friendTotalPages); 

        } catch (error) {
            console.error('Error fetching friend data:', error);
        }
    }, [activeTab, pendingPage, friendPage, friendSearchQuery, pendingSearchQuery]);

    useEffect(() => {
        fetchFriendData();
    }, [fetchFriendData]);

    const handleFriendSearch = (query) => {
        setFriendSearchQuery(query);
        setFriendPage(1); // Reset to page 1 when searching
    };

    const handlePendingSearch = (query) => {
        setPendingSearchQuery(query);
        setPendingPage(1); // Reset to page 1 when searching
    };

    const handleAccept = async (requesterId) => {
        try {
            await axios.post('/friend/accept', { requester_id: requesterId });
            fetchFriendData(); // Refresh data after accepting
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const handleReject = async (requesterId) => {
        try {
            await axios.post('/friend/reject', { requester_id: requesterId });
            fetchFriendData(); // Refresh data after rejecting
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    const handleUnfriend = async (friendId) => {
        try {
            await axios.post('/friend/break', { friend_id: friendId });
            fetchFriendData(); // Refresh data after unfriending
        } catch (error) {
            console.error('Error unfriending:', error);
        }
    };

    return (
        <div className="friend-page">
            <div className="left-column">
                <SearchFriend onSearch={handleFriendSearch} />
            </div>
            <div className="middle-column">
                <div className="tab">
                    <button
                        className={`tablinks ${activeTab === 'PendingRequest' ? 'active' : ''}`}
                        onClick={() => setActiveTab('PendingRequest')}
                    >
                        Pending Requests
                    </button>
                    <button
                        className={`tablinks ${activeTab === 'FriendList' ? 'active' : ''}`}
                        onClick={() => setActiveTab('FriendList')}
                    >
                        Friend List
                    </button>
                </div>
            </div>
            <div className="right-column">
                {activeTab === 'PendingRequest' && (
                    <PendingRequests
                        pendingRequests={friendData.pendingRequests}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onPageChange={setPendingPage}
                        currentPage={pendingPage}
                        totalPages={pendingTotalPages} // Set total pages from backend
                        onSearch={handlePendingSearch}
                    />
                )}
                {activeTab === 'FriendList' && (
                    <FriendList
                        friends={friendData.friends}
                        onUnfriend={handleUnfriend}
                        onPageChange={setFriendPage}
                        currentPage={friendPage}
                        totalPages={friendTotalPages} // Set total pages from backend
                        onSearch={handleFriendSearch}
                    />
                )}
            </div>
        </div>
    );
}

export default FriendPage;

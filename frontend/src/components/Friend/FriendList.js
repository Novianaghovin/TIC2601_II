import React, { useState } from 'react';

const FriendList = ({ friends, onUnfriend, onPageChange, currentPage, totalPages, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value); // Call the parent function to perform the search
    };

    return (
        <div className="friend-table-container">
            <div className="friend-search-bar-container">
                <input
                    type="text"
                    placeholder="Search friend list"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="friend-search-bar"
                />
            </div>

            <table className="friend-list-table">
                <thead>
                    <tr>
                        <th>Friend</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {friends.map(friend => (
                        <tr key={friend.friendship_id}>
                            <td>{friend.first_name} {friend.last_name}</td>
                            <td>
                                <button onClick={() => onUnfriend(friend.friend_id)} className="reject-button">Unfriend</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
                <button onClick={() => onPageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages || totalPages === 0}>Next</button>
            </div>
        </div>
    );
};

export default FriendList;

import React, { useState } from 'react';

const PendingRequests = ({ pendingRequests, onAccept, onReject, onPageChange, currentPage, totalPages, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value); // Call the parent function to perform the search
    };

    return (
        <div className="friend-table-container">
            <input
                type="text"
                placeholder="Search pending requests"
                value={searchTerm}
                onChange={handleSearch}
                className="friend-search-bar"
            />

            <table className="pending-table">
                <thead>
                    <tr>
                        <th>Request</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingRequests.map(req => (
                        <tr key={req.friendship_id}>
                            <td>{req.first_name} {req.last_name} sent a friend request</td>
                            <td>
                                <button onClick={() => onAccept(req.requester_id)} className="accept-button">Accept</button>
                                <button onClick={() => onReject(req.requester_id)} className="reject-button">Reject</button>
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

export default PendingRequests;

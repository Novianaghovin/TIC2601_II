import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputActivityType from '../components/InputActivityType';
import InputActivityDuration from '../components/InputActivityDuration';
import InputDistance from '../components/InputDistance';
import InputStepCount from '../components/InputStepCount';
import InputUserId from '../components/InputUserId';

function ActivityLog() {
    const [activities, setActivities] = useState([]);
    const [formData, setFormData] = useState({
        activity_name: '',
        activity_duration: '',
        distance: '',
        step_count: '',
        user_id: ''
    });
    const [editingLogId, setEditingLogId] = useState(null);
    
    useEffect(() => {
        const userId = 1; // Hardcoded user ID for testing
        fetchActivityLogs(userId);
    }, []);

    const fetchActivityLogs = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/activity_log/user/${userId}`);
            setActivities(response.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setActivities([]); // Set an empty array if no logs found
            } else {
                console.error("Error fetching activity logs:", error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const saveLog = async () => {
        try {
            const userId = 1; // Hardcoded user ID for testing
            await axios.post('http://localhost:3000/api/activity_log', { ...formData, user_id: userId });
            alert('Activity log created successfully!');
            fetchActivityLogs(userId);
            clearForm();
        } catch (error) {
            alert('Error saving activity log');
            console.error("Error:", error);
        }
    };

    const loadLogForEdit = (log) => {
        setFormData({
            activity_name: log.activity_name,
            activity_duration: log.activity_duration,
            distance: log.distance,
            step_count: log.step_count,
            user_id: log.user_id
        });
        setEditingLogId(log.log_id); // Set the ID of the log being edited
    };

    const clearForm = () => {
        setFormData({
            activity_name: '',
            activity_duration: '',
            distance: '',
            step_count: '',
            user_id: ''
        });
        setEditingLogId(null); // Clear editing state
    };

    return (
        <div>
            <h1>My Activity</h1>
            <form id="logForm" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="activityType">Activity Type:</label>
                <InputActivityType value={formData.activity_name} onChange={handleInputChange} />
                <InputActivityDuration value={formData.activity_duration} onChange={handleInputChange} />
                <InputDistance value={formData.distance} onChange={handleInputChange} />
                <InputStepCount value={formData.step_count} onChange={handleInputChange} />
                <InputUserId value={formData.user_id} onChange={handleInputChange} />
                <button type="button" onClick={saveLog}>
                    {editingLogId ? 'Update Activity' : 'Record Activity'}
                </button>
                {editingLogId && (
                    <button type="button" onClick={clearForm} style={{ marginLeft: '10px' }}>
                        Cancel Edit
                    </button>
                )}
            </form>

            {/* Table to display activity logs */}
            <table border="1" style={{ marginTop: '20px', width: '100%' }}>
                <thead>
                    <tr>
                        <th>Activity Type</th>
                        <th>Duration (minutes)</th>
                        <th>Distance (km)</th>
                        <th>Step Count</th>
                        <th>Calories Burnt</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.length > 0 ? (
                        activities.map((log) => (
                            <tr key={log.log_id}>
                                <td>{log.activity_name}</td>
                                <td>{log.activity_duration}</td>
                                <td>{log.distance}</td>
                                <td>{log.step_count}</td>
                                <td>{log.calories_burnt}</td>
                                <td>    
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{" "}
                                {new Date(log.timestamp).toLocaleDateString('en-GB')}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No activity logs found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ActivityLog;
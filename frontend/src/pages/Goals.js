import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputGoalName from '../components/InputGoalName';
import InputTargetDistance from '../components/InputTargetDistance';
import DateTime from 'react-datetime';
import "react-datetime/css/react-datetime.css";

function Goals() {
    const [goals, setGoals] = useState([]);
    const [formData, setFormData] = useState({
        goal_name: '',
        goal_deadline: new Date(),
        target_distance: '',
        activity_id: '',
        user_id: ''
    });
    const [editingGoalId, setEditingGoalId] = useState(null);

    useEffect(() => {
        const userId = 1; // Hardcoded user ID for testing
        fetchGoals(userId);
    }, []);

    const fetchGoals = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/goals?user_id=${userId}`);
            setGoals(response.data);
        } catch (error) {
            console.error("Error fetching goals:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDeadlineChange = (date) => {
        setFormData({ ...formData, goal_deadline: date });
    };

    const createOrUpdateGoal = async () => {
        try {
            const userId = 1; // Hardcoded user ID for testing
            const formattedData = {
                ...formData,
                goal_deadline: formData.goal_deadline.toISOString()
            };

            if (editingGoalId) {
                await axios.put(`http://localhost:3000/api/goals/${editingGoalId}`, { ...formattedData, user_id: userId });
                alert('Goal updated successfully!');
            } else {
                await axios.post('http://localhost:3000/api/goals', { ...formattedData, user_id: userId });
                alert('Goal created successfully!');
            }
            fetchGoals(userId);
            clearForm();
        } catch (error) {
            alert('Error setting goal');
            console.error("Error:", error);
        }
    };
    
    const loadGoalForEdit = (goal) => {
        setFormData({
            goal_name: goal.goal_name,
            goal_deadline: new Date(goal.goal_deadline),
            target_distance: goal.target_distance,
            activity_id: goal.activity_id,
            user_id: goal.user_id
        });
        setEditingGoalId(goal.goal_id);
    };

    const cancelEdit = () => {
        setEditingGoalId(null);
        clearForm();
    };

    const clearForm = () => {
        setFormData({
            goal_name: '',
            goal_deadline: new Date(),
            target_distance: '',
            activity_id: '',
            user_id: ''
        });
    };

    const deleteGoal = async (goalId, userId) => {
        try {
            await axios.delete(`http://localhost:3000/api/goals/${goalId}?user_id=${userId}`);
            alert('Goal deleted successfully!');
            fetchGoals(userId);
        } catch (error) {
            alert('Error deleting goal');
            console.error("Error:", error);
        }
    };

    return (
        <div>
            <h1>My Goals</h1>
            <form id="goalForm" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <InputGoalName value={formData.goal_name} onChange={handleInputChange} />
                <DateTime
                    value={formData.goal_deadline}
                    onChange={handleDeadlineChange}
                    dateFormat="DD/MM/YYYY"
                    timeFormat="HH:mm"
                />
                <InputTargetDistance value={formData.target_distance} onChange={handleInputChange} />
                
                <select
                    name="activity_id"
                    value={formData.activity_id}
                    onChange={handleInputChange}
                    required
                >
                    <option value="" disabled>Select Activity Type</option>
                    <option value="1">Run</option>
                    <option value="2">Swim</option>
                    <option value="3">Cycle</option>
                    <option value="4">Walk</option>
                </select>

                <input
                    type="number"
                    name="user_id"
                    placeholder="User ID"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    required
                />
                
                <button type="button" onClick={createOrUpdateGoal}>
                    {editingGoalId ? 'Update Goal' : 'Set Goal'}
                </button>
                {editingGoalId && (
                    <button type="button" onClick={cancelEdit} style={{ display: 'inline' }}>
                        Cancel Edit
                    </button>
                )}
            </form>

            <table border="1" style={{ marginTop: '20px', width: '100%' }}>
                <thead>
                    <tr>
                        <th>Goal Name</th>
                        <th>Deadline</th>
                        <th>Target Distance (km)</th>
                        <th>Progress (%)</th>
                        <th>Activity Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {goals.length > 0 ? (
                        goals.map((goal) => (
                            <tr key={goal.goal_id}>
                                <td>{goal.goal_name}</td>
                                <td>{new Date(goal.goal_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{" "}
                                    {new Date(goal.goal_deadline).toLocaleDateString('en-GB')}</td>
                                <td>{goal.target_distance}</td>
                                <td>{goal.progress !== null ? goal.progress.toFixed(2) : '0.00'}%</td>
                                <td>{goal.activity_name}</td>
                                <td>
                                    <button onClick={() => loadGoalForEdit(goal)}>Edit</button>
                                    <button onClick={() => deleteGoal(goal.goal_id, goal.user_id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No goals found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Goals;
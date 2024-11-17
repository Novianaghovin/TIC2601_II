import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputGoalName from '../components/InputGoalName';
import InputTargetDistance from '../components/InputTargetDistance';
import DateTime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import NavBar from "../components/Shared/Navbar";

function Goals() {
    const [goals, setGoals] = useState([]);
    const [formData, setFormData] = useState({
        goal_name: '',
        goal_deadline: new Date(),
        target_distance: '',
        activity_id: ''
    });
    const [editingGoalId, setEditingGoalId] = useState(null);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const token = localStorage.getItem('accessToken'); // Retrieve token from localStorage
            const response = await axios.get('http://localhost:3000/api/goals', {
                headers: {
                    Authorization: `Bearer ${token}` // Include token in Authorization header
                }
            });
            setGoals(response.data);
        } catch (error) {
            console.error("Error fetching goals:", error);
            setGoals([]); // Set an empty list if there's an error
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
            const token = localStorage.getItem('accessToken'); // Retrieve token from localStorage
            const formattedData = {
                ...formData,
                goal_deadline: formData.goal_deadline instanceof Date ? formData.goal_deadline.toISOString() : formData.goal_deadline
            };

            if (editingGoalId) {
                // Update an existing goal
                await axios.put(`http://localhost:3000/api/goals/${editingGoalId}`, formattedData, {
                    headers: {
                        Authorization: `Bearer ${token}` // Include token in Authorization header
                    }
                });
                alert('Goal updated successfully!');
            } else {
                // Create a new goal
                await axios.post('http://localhost:3000/api/goals', formattedData, {
                    headers: {
                        Authorization: `Bearer ${token}` // Include token in Authorization header
                    }
                });
                alert('Goal created successfully!');
            }
            fetchGoals();
            clearForm();
        } catch (error) {
            if (error.response) {
                console.error("Error response:", error.response.data);
                alert(`Error setting goal: ${error.response.data.error}`);
            } else {
                console.error("Error:", error);
                alert('Error setting goal. Please check console for details.');
            }
        }
    };

    const loadGoalForEdit = (goal) => {
        setFormData({
            goal_name: goal.goal_name,
            goal_deadline: new Date(goal.goal_deadline),
            target_distance: goal.target_distance,
            activity_id: goal.activity_id
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
            activity_id: ''
        });
    };

    const deleteGoal = async (goalId) => {
        try {
            const token = localStorage.getItem('accessToken'); // Retrieve token from localStorage
            await axios.delete(`http://localhost:3000/api/goals/${goalId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Include token in Authorization header
                }
            });
            alert('Goal deleted successfully!');
            fetchGoals();
        } catch (error) {
            alert('Error deleting goal');
            console.error("Error:", error);
        }
    };

    return (
        <div>
            <NavBar /> {/* Add the navigation bar */}
            <div style={{ padding: '20px' }}>
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
                                    <td>{new Date(goal.goal_deadline).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                    <td>{goal.target_distance}</td>
                                    <td>{goal.progress ? parseFloat(goal.progress).toFixed(2) : '0.00'}%</td>
                                    <td>{goal.activity_name}</td>
                                    <td>
                                        <button onClick={() => loadGoalForEdit(goal)}>Edit</button>
                                        <button onClick={() => deleteGoal(goal.goal_id)}>Delete</button>
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
        </div>
    );
}

export default Goals;
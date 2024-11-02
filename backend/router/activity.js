const apiUrl = 'http://localhost:3000/activity_log'; // Update with your backend URL
//import corsMiddleware from '../config/corsConfig.js';
// Function to fetch all activity logs
async function fetchActivityLogs() {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = ''; // Clear existing logs
    data.forEach(log => {
        logContainer.innerHTML += `<div>
            <strong>Log ID:</strong> ${log.log_id}, 
            <strong>Duration:</strong> ${log.activity_duration}, 
            <strong>Distance:</strong> ${log.distance} 
            <button onclick="deleteLog(${log.log_id})">Delete</button> 
            <button onclick="populateUpdateForm(${log.log_id}, '${log.activity_duration}', '${log.distance}', ${log.user_id}, ${log.activity_id}, ${log.step_count})">Update</button>
        </div>`;
    });
}

// Function to create a new activity log
async function createLog() {
    const activityDuration = document.getElementById('activityDuration').value;
    const distance = document.getElementById('distance').value;
    const userId = document.getElementById('userId').value;
    const activityId = document.getElementById('activityId').value;
    const stepCount = document.getElementById('stepCount').value;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity_duration: activityDuration, distance, user_id: userId, activity_id: activityId, step_count: stepCount })
    });

    if (response.ok) {
        alert('Activity log created successfully!');
        fetchActivityLogs();
    } else {
        alert('Error creating activity log');
    }
}

// Function to update an existing activity log
async function updateLog(logId) {
    const activityDuration = document.getElementById('activityDuration').value;
    const distance = document.getElementById('distance').value;
    const userId = document.getElementById('userId').value;
    const activityId = document.getElementById('activityId').value;
    const stepCount = document.getElementById('stepCount').value;

    const response = await fetch(`${apiUrl}/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity_duration: activityDuration, distance, user_id: userId, activity_id: activityId, step_count: stepCount })
    });

    if (response.ok) {
        alert('Activity log updated successfully!');
        fetchActivityLogs();
    } else {
        alert('Error updating activity log');
    }
}

// Function to delete an activity log
async function deleteLog(logId) {
    const response = await fetch(`${apiUrl}/${logId}`, { method: 'DELETE' });
    if (response.ok) {
        alert('Activity log deleted successfully!');
        fetchActivityLogs();
    } else {
        alert('Error deleting activity log');
    }
}

// Function to populate form for updating log
function populateUpdateForm(logId, activityDuration, distance, userId, activityId, stepCount) {
    document.getElementById('activityDuration').value = activityDuration;
    document.getElementById('distance').value = distance;
    document.getElementById('userId').value = userId;
    document.getElementById('activityId').value = activityId;
    document.getElementById('stepCount').value = stepCount;
    document.getElementById('updateLogButton').onclick = () => updateLog(logId);
}

// Call fetchActivityLogs when the page loads
window.onload = fetchActivityLogs;


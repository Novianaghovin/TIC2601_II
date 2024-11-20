import React from 'react';

function InputActivityDuration({ value, onChange }) {
    return (
        <input
            type="number"
            name="activity_duration"
            value={value}
            onChange={onChange}
            placeholder="Activity Duration (minutes)"
            required
        />
    );
}

export default InputActivityDuration;
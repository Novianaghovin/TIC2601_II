import React from 'react';

function InputGoalName({ value, onChange }) {
    return (
        <input
            type="text"
            name="goal_name"
            value={value}
            onChange={onChange}
            placeholder="Goal Name"
            required
        />
    );
}

export default InputGoalName;
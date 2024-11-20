import React from 'react';

function InputActivityType({ value, onChange }) {
    return (
        <select name="activity_name" value={value} onChange={onChange} required>
            <option value="" disabled>Select Activity Type</option>
            <option value="run">Run</option>
            <option value="swim">Swim</option>
            <option value="cycle">Cycle</option>
            <option value="walk">Walk</option>
        </select>
    );
}

export default InputActivityType;
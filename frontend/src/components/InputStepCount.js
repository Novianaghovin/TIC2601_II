import React from 'react';

function InputStepCount({ value, onChange }) {
    return (
        <input
            type="number"
            name="step_count"
            value={value}
            onChange={onChange}
            placeholder="Step Count"
            min="0"
            required
        />
    );
}

export default InputStepCount;
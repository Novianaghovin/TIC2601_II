import React from 'react';

function InputDistance({ value, onChange }) {
    return (
        <input
            type="number"
            name="distance"
            value={value}
            onChange={onChange}
            placeholder="Distance (km)"
            step="0.01"
            required
        />
    );
}

export default InputDistance;
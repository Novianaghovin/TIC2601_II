import React from 'react';

function InputTargetDistance({ value, onChange }) {
    return (
        <input
            type="number"
            name="target_distance"
            value={value}
            onChange={onChange}
            placeholder="Target Distance (km)"
            step="0.01"
            required
        />
    );
}

export default InputTargetDistance;
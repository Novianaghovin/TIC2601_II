import React from 'react';

function InputUserId({ value, onChange }) {
    return (
        <input
            type="number"
            name="user_id"
            value={value}
            onChange={onChange}
            placeholder="User ID"
            required
        />
    );
}

export default InputUserId;
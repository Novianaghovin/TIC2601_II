import React from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function InputGoalDeadline({ value, onChange }) {
    return (
        <Flatpickr
            data-enable-time
            value={value}
            onChange={(date) => onChange(date[0])}
            options={{ dateFormat: 'd/m/Y' }}
            placeholder="Select Deadline"
            required
        />
    );
}

export default InputGoalDeadline;
// BadgeForm.js
import React from 'react';

const BadgeForm = ({ month, year, onMonthChange, onYearChange, onFetch }) => {
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
        yearOptions.push(i);
    }

    const monthOptions = Array.from({ length: 12 }, (_, index) => (index + 1).toString().padStart(2, '0'));

    return (
        <div>
            <h2>Fetch Badge Data</h2>

            <div>
                <label htmlFor="month">Month: </label>
                <select
                    id="month"
                    value={month}
                    onChange={onMonthChange}
                >
                    <option value="">Select Month</option>
                    {monthOptions.map((monthOption) => (
                        <option key={monthOption} value={monthOption}>
                            {monthOption}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="year">Year: </label>
                <select
                    id="year"
                    value={year}
                    onChange={onYearChange}
                >
                    <option value="">Select Year</option>
                    {yearOptions.map((yearOption) => (
                        <option key={yearOption} value={yearOption}>
                            {yearOption}
                        </option>
                    ))}
                </select>
            </div>

            <button onClick={onFetch}>Fetch Badges</button>
        </div>
    );
};

export default BadgeForm;

import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function Layout() {
    return (
        <div style={{ margin: '40px' }}>
            <nav>
                <Link to="/activity-log">Activity Log</Link>
                <Link to="/goals">Goals</Link>
            </nav>
            <Outlet />
        </div>
    );
}

export default Layout;
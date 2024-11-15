import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Layout from './pages/Layout';
import ActivityLog from './pages/ActivityLog';
import Goals from './pages/Goals';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="activity-log" element={<ActivityLog />} />
                    <Route path="goals" element={<Goals />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
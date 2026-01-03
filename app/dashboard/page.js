"use client";

import React from 'react';

export default function DashboardPage() {
    console.log("Dashboard PAGE Rendered");
    return (
        <div style={{ padding: '100px', textAlign: 'center', zIndex: 9999, position: 'relative' }}>
            <h1 style={{ color: 'red', fontSize: '40px' }}>TEST DASHBOARD</h1>
            <p style={{ color: 'white' }}>If you see this, the route works and hooks were the issue.</p>
        </div>
    );
}

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const Layout = () => {
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F4F5F7' }}>
            <Sidebar />
            <div className="dashboard-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <TopNav />
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import './Layout.css'; // We will create this file for scoped layout styles

const Layout = () => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-main-content">
                <TopNav />
                <div className="app-page-container">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;

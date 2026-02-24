import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import ProfileDrawer from './ProfileDrawer';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentView, setCurrentView] = useState('overview');

    // Connect to Auth Context
    const { user } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // If user is null (loading or not logged in), checking this safety.
    // PrivateRoute guards this, but Layout might render briefly.
    const safeUser = user || { username: 'Loading...', picture: '' };

    return (
        <div className="app-layout">
            <Sidebar isOpen={isSidebarOpen} currentView={currentView} onViewChange={setCurrentView} />
            <div className="app-main-content">
                <TopNav
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    isOpen={isSidebarOpen}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    user={safeUser}
                    onOpenProfile={() => setIsProfileOpen(true)}
                />
                <div className="app-page-container">
                    <Outlet context={{ searchTerm, currentView }} />
                </div>
            </div>

            <ProfileDrawer
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={safeUser}
            />
        </div>
    );
};

export default Layout;

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import './Layout.css'; // We will create this file for scoped layout styles

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentView, setCurrentView] = React.useState('overview'); // Lifted state for TopNav pills

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
                />
                <div className="app-page-container">
                    <Outlet context={{ searchTerm, currentView }} />
                </div>
            </div>
        </div>
    );
};

export default Layout;

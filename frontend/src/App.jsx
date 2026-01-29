import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Login from './pages/Login'; // Import new Login page
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import TaskBoard from './pages/TaskBoard';
import ProjectLeadDashboard from './pages/ProjectLeadDashboard';
import SprintPlanner from './pages/SprintPlanner';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AcceptInvite from './pages/AcceptInvite';
import AdminDashboard from './pages/AdminDashboard';
import ProjectDashboard from './pages/ProjectDashboard';
import BacklogView from './components/BacklogView';
import PrivateRoute from './components/PrivateRoute';
import './index.css';

function App() {
  console.log('App component rendering');
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />

        {/* Dashboard Routes with Layout */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="board" element={<TaskBoard />} />
          <Route path="sprint" element={<SprintPlanner />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="project-lead" element={<ProjectLeadDashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Project Routes - Now wrapped in Layout for consistent Sidebar/Header */}
        <Route path="/project/:projectId" element={<Layout />}>
          <Route element={<PrivateRoute><ProjectDashboard /></PrivateRoute>}>
            <Route index element={<Navigate to="board" replace />} />
            <Route path="board" element={<TaskBoard />} />
            <Route path="backlog" element={<BacklogView />} />
            <Route path="sprint" element={<SprintPlanner />} />
            <Route path="reports" element={<div>Reports Coming Soon</div>} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

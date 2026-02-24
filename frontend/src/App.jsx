import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Login from './pages/Login'; // Import new Login page
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import TaskBoard from './pages/TaskBoard';
import SprintPlanner from './pages/SprintPlanner';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AcceptInvite from './pages/AcceptInvite';
import AdminDashboard from './pages/AdminDashboard';
import ProjectDashboard from './pages/ProjectDashboard';
import CalendarView from './pages/CalendarView';
import BacklogView from './components/BacklogView';
import PrivateRoute from './components/PrivateRoute';
import MyEarnings from './pages/MyEarnings';
import ProjectBudgetConfig from './components/dashboard/ProjectBudgetConfig';
import TeamsPage from './pages/TeamsPage';
import AcceptTeamInvite from './pages/AcceptTeamInvite';
import './index.css';

import { AuthProvider } from './context/AuthContext';

function App() {
  console.log('App component rendering');
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/accept-invite/:token" element={<AcceptInvite />} />
          <Route path="/accept-team-invite/:token" element={<AcceptTeamInvite />} />

          {/* Dashboard Routes with Layout */}
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="board" element={<TaskBoard />} />
            <Route path="sprint" element={<SprintPlanner />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="settings" element={<Settings />} />
            <Route path="earnings" element={<MyEarnings />} />
            <Route path="teams" element={<TeamsPage />} />
          </Route>

          {/* Project Routes - Now wrapped in Layout for consistent Sidebar/Header */}
          <Route path="/project/:projectId" element={<Layout />}>
            <Route element={<PrivateRoute />}>
              <Route element={<ProjectDashboard />}>
                <Route index element={<Navigate to="board" replace />} />
                <Route path="board" element={<TaskBoard />} />
                <Route path="backlog" element={<BacklogView />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="calendar" element={<CalendarView />} />
                <Route path="accept-invite" element={<AcceptInvite />} />
                <Route path="sprint" element={<SprintPlanner />} />
                <Route path="reports" element={<div>Reports Coming Soon</div>} />
                <Route path="settings" element={<ProjectBudgetConfig />} />
              </Route>
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

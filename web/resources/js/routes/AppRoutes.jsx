import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import ProjectsPage from '../pages/ProjectsPage';
import NewProjectPage from '../pages/NewProjectPage';
import ProjectSuccessPage from '../pages/ProjectSuccessPage';
import ProjectDetailsPage from '../pages/ProjectDetailsPage';
import EngineerMilestoneInputPage from '../pages/EngineerMilestoneInputPage';
import EngineerMilestoneReviewPage from '../pages/EngineerMilestoneReviewPage';
import EngineerMilestoneSuccessPage from '../pages/EngineerMilestoneSuccessPage';
import ProjectApprovalPage from '../pages/ProjectApprovalPage';
import TasksPage from '../pages/TasksPage';
import ReportsPage from '../pages/ReportsPage';
import ProfilePage from '../pages/ProfilePage';
import useAuth from '../hooks/useAuth';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFDFF]">
                <p className="text-[#A1A1A1] text-sm">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/projects"              element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                <Route path="/projects/new"           element={<ProtectedRoute><NewProjectPage /></ProtectedRoute>} />
                <Route path="/projects/success"       element={<ProtectedRoute><ProjectSuccessPage /></ProtectedRoute>} />
                <Route path="/projects/:id"           element={<ProtectedRoute><ProjectDetailsPage /></ProtectedRoute>} />
                <Route path="/projects/:id/milestone-input"   element={<ProtectedRoute><EngineerMilestoneInputPage /></ProtectedRoute>} />
                <Route path="/projects/:id/milestone-review"  element={<ProtectedRoute><EngineerMilestoneReviewPage /></ProtectedRoute>} />
                <Route path="/projects/:id/milestone-success" element={<ProtectedRoute><EngineerMilestoneSuccessPage /></ProtectedRoute>} />
                <Route path="/projects/:id/approval"  element={<ProtectedRoute><ProjectApprovalPage /></ProtectedRoute>} />
                <Route path="/tasks"                  element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
                <Route path="/reports"                element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/profile"                element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}
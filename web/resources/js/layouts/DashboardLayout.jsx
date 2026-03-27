import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import Header from '../components/header/Header';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

export default function DashboardLayout({ children, pageTitle }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            // ignore
        }
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#F5F5FA] overflow-hidden">
            {/* Sidebar */}
            <Sidebar onLogout={handleLogout} />

            {/* Right side: Header + Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header pageTitle={pageTitle} user={user} loading={loading} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

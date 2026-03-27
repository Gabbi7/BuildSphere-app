import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ pageTitle, user, loading }) {
    const initials = user
        ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
        : '';

    return (
        <header className="flex items-center justify-between bg-white border-b border-[#F0F0F8] px-6 py-4 shrink-0">
            {/* Page title */}
            <h1 className="text-xl font-bold text-[#1A1A1A]">{pageTitle}</h1>

            {/* Clickable user section → /profile */}
            {loading ? (
                /* Skeleton while user data loads */
                <div className="flex items-center gap-3 animate-pulse">
                    <div className="hidden sm:flex flex-col items-end gap-1.5">
                        <div className="h-3 w-24 bg-[#E8E8FF] rounded-full" />
                        <div className="h-2.5 w-16 bg-[#F0F0F8] rounded-full" />
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#E8E8FF]" />
                </div>
            ) : (
                <Link
                    to="/profile"
                    className="flex items-center gap-3 hover:opacity-75 transition-opacity"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-[#1A1A1A]">
                            {user ? `${user.first_name} ${user.last_name}` : ''}
                        </p>
                        <p className="text-xs text-[#A1A1A1]">{user?.role ?? ''}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#706BFF] flex items-center justify-center text-white text-sm font-bold">
                        {initials}
                    </div>
                </Link>
            )}
        </header>
    );
}

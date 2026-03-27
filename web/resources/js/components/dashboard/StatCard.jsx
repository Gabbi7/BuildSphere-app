import React from 'react';

export default function StatCard({ label, value, color }) {
    return (
        <div className="bg-white rounded-2xl px-6 py-5 shadow-sm border border-[#F0F0F8] flex items-center justify-between flex-1">
            <p className="text-base font-bold text-[#1A1A1A] leading-tight">{label}</p>
            <p className={`text-5xl font-extrabold leading-none ${color}`}>{value}</p>
        </div>
    );
}

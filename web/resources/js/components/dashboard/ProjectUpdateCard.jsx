import React from 'react';

const countColors = ['text-orange-400', 'text-yellow-500', 'text-green-500', 'text-blue-500'];

export default function ProjectUpdateCard({ count, index }) {
    const color = countColors[index % countColors.length];

    return (
        <div className="bg-[#F8F8FF] rounded-2xl px-5 py-4 mb-3 flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-[#1A1A1A]">Project Name</p>
                <p className="text-xs text-[#A1A1A1] mt-0.5">{count} updates received today</p>
            </div>
            <p className={`text-4xl font-extrabold ${color}`}>{count}</p>
        </div>
    );
}

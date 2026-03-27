import React from 'react';

export default function ProjectTeamCard({ memberCount, tasksDone, tasksTotal, members }) {
    const pct = Math.round((tasksDone / tasksTotal) * 100);

    // Multi-color progress bar segments
    const segments = [
        { color: 'bg-[#706BFF]', width: `${pct * 0.5}%` },
        { color: 'bg-yellow-400',  width: `${pct * 0.25}%` },
        { color: 'bg-red-400',     width: `${pct * 0.15}%` },
        { color: 'bg-green-400',   width: `${pct * 0.1}%` },
    ];

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0F0F8]">
            <h4 className="font-bold text-[#1A1A1A] text-sm mb-0.5">Project Team</h4>
            <p className="text-xs text-[#A1A1A1]">Location, City</p>
            <div className="flex items-center gap-1 mt-0.5 mb-4">
                <svg className="w-3 h-3 text-[#A1A1A1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-xs text-[#A1A1A1]">Engr. Name</p>
            </div>

            <p className="text-xs text-[#6B7280] mb-1">Tasks Done: {tasksDone}/{tasksTotal}</p>

            {/* Multi-color progress bar */}
            <div className="flex w-full h-2 rounded-full overflow-hidden bg-[#F0F0F8] mb-1">
                {segments.map((s, i) => (
                    <div key={i} className={`h-full ${s.color}`} style={{ width: s.width }} />
                ))}
            </div>
            <p className="text-xs text-[#6B7280] text-right mb-4">{pct}%</p>

            {/* Avatar circles */}
            <div className="flex items-center gap-1.5">
                {members.map((m, i) => (
                    <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: m.color }}
                    >
                        {m.initials}
                    </div>
                ))}
                <div className="w-7 h-7 rounded-full bg-[#F0F0F8] flex items-center justify-center text-[#6B7280] text-sm font-bold">
                    +
                </div>
            </div>
        </div>
    );
}

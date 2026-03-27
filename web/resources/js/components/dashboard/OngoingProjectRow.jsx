import React from 'react';

const statusStyles = {
    'On Track': 'bg-green-500 text-white',
    'Delayed':  'bg-red-500 text-white',
    'Near Due': 'bg-orange-400 text-white',
};

export default function OngoingProjectRow({ status, progress, daysLeft }) {
    const badgeClass = statusStyles[status] ?? 'bg-gray-400 text-white';

    return (
        <div className="bg-[#F8F8FF] rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-[#1A1A1A]">Project Name</p>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}>
                        {status}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[#706BFF]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-semibold text-[#706BFF]">{daysLeft} days left</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <p className="text-xs text-[#6B7280] shrink-0">Progress</p>
                <div className="flex-1 h-2 bg-[#E8E8FF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#706BFF] rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs font-semibold text-[#6B7280] shrink-0">{progress}%</p>
            </div>
        </div>
    );
}

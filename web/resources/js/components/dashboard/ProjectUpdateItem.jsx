import React from 'react';

const statusStyles = {
    'In Progress': 'bg-blue-50 text-blue-600',
    'On Hold':     'bg-yellow-50 text-yellow-600',
    'Completed':   'bg-green-50 text-green-600',
    'Proposed':    'bg-purple-50 text-purple-600',
};

export default function ProjectUpdateItem({ projectName, status, date, description }) {
    const badgeClass = statusStyles[status] ?? 'bg-gray-100 text-gray-600';

    return (
        <div className="flex items-start gap-4 py-4 border-b border-[#F0F0F8] last:border-0">
            {/* Dot indicator */}
            <div className="w-2 h-2 rounded-full bg-[#706BFF] mt-2 shrink-0" />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{projectName}</p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${badgeClass}`}>
                        {status}
                    </span>
                </div>
                {description && (
                    <p className="text-xs text-[#A1A1A1] mt-0.5 truncate">{description}</p>
                )}
            </div>

            <p className="text-xs text-[#A1A1A1] shrink-0">{date}</p>
        </div>
    );
}

import React from 'react';

export default function TaskViewToggle({ view, onChange }) {
    const base    = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
    const active  = 'bg-white border border-[#E0E0F0] text-[#5B5BD6] shadow-sm';
    const inactive = 'text-[#9090A8] hover:text-[#5B5BD6]';

    return (
        <div className="flex items-center gap-1 bg-[#F3F3FB] rounded-xl p-1">
            <button
                id="task-list-view-btn"
                onClick={() => onChange('list')}
                className={`${base} ${view === 'list' ? active : inactive}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List View
            </button>
            <button
                id="task-kanban-view-btn"
                onClick={() => onChange('kanban')}
                className={`${base} ${view === 'kanban' ? active : inactive}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Kanban View
            </button>
        </div>
    );
}

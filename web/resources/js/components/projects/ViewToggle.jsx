import React from 'react';

export default function ViewToggle({ view, onChange }) {
    const base = 'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer';
    const active = 'border-2 border-[#706BFF] text-[#706BFF] bg-white';
    const inactive = 'border-2 border-[#E8E8FF] text-[#A1A1A1] bg-white hover:border-[#C6C4FF]';

    return (
        <div className="flex gap-2">
            <button className={`${base} ${view === 'grid' ? active : inactive}`} onClick={() => onChange('grid')}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid View
            </button>
            <button className={`${base} ${view === 'list' ? active : inactive}`} onClick={() => onChange('list')}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                List View
            </button>
        </div>
    );
}

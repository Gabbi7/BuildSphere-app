import React from 'react';

export default function EmptyTaskState({ message = 'No tasks found.', onAdd, canAdd }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F3F3FB] flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#A0A0C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
            <p className="text-[#6B6B8D] font-medium text-sm mb-1">{message}</p>
            <p className="text-[#A0A0C0] text-xs mb-4">Try adjusting your filters or create a new task.</p>
            {canAdd && onAdd && (
                <button
                    onClick={onAdd}
                    className="px-4 py-2 bg-[#5B5BD6] text-white text-sm font-medium rounded-lg hover:bg-[#4747B8] transition-colors"
                >
                    + Add Task
                </button>
            )}
        </div>
    );
}

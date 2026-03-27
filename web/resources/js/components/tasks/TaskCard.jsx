import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDate, getUserInitials } from '../../utils/taskHelpers';

export default function TaskCard({ task, onClick }) {
    const assignee = task.assigned_to?.name ?? '—';
    const initials = getUserInitials(assignee);

    return (
        <div
            onClick={() => onClick(task)}
            className="bg-white rounded-xl border border-[#F0F0F8] p-4 cursor-pointer
                       hover:shadow-md hover:border-[#D8D8F0] transition-all group"
        >
            {/* Priority if high/urgent */}
            {(task.priority === 'high' || task.priority === 'urgent') && (
                <div className="mb-2">
                    <PriorityBadge priority={task.priority} />
                </div>
            )}

            {/* Project label */}
            {task.project && (
                <p className="text-[10px] font-medium text-[#5B5BD6] mb-1 truncate">
                    {task.project.name}
                </p>
            )}

            {/* Title */}
            <p className="text-sm font-semibold text-[#1A1A2E] mb-3 line-clamp-2 leading-snug">
                {task.title}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto">
                {/* Assignee avatar */}
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#E8E8FF] text-[#5B5BD6] text-[9px] font-bold flex items-center justify-center">
                        {initials}
                    </div>
                    <span className="text-[10px] text-[#9090A8] truncate max-w-[80px]">{assignee}</span>
                </div>

                {/* Due date + comment count */}
                <div className="flex items-center gap-2 text-[10px] text-[#9090A8]">
                    <span>{formatDate(task.due_date)}</span>
                    {task.comments_count > 0 && (
                        <span className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {task.comments_count}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

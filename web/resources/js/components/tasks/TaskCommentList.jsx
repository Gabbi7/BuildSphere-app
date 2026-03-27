import React from 'react';
import { formatDateTime, getUserInitials } from '../../utils/taskHelpers';

export default function TaskCommentList({ comments }) {
    if (!comments || comments.length === 0) {
        return (
            <p className="text-xs text-[#A0A0C0] italic py-2">No comments yet. Be the first to comment.</p>
        );
    }

    return (
        <div className="space-y-3">
            {comments.map(c => {
                const initials = getUserInitials(c.user?.name ?? '?');
                return (
                    <div key={c.id} className="flex gap-3 group">
                        <div className="w-7 h-7 rounded-full bg-[#E8E8FF] text-[#5B5BD6] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {initials}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-semibold text-[#1A1A2E]">{c.user?.name ?? 'Unknown'}</span>
                                <span className="text-[10px] text-[#A0A0C0]">{formatDateTime(c.created_at)}</span>
                            </div>
                            <p className="text-sm text-[#3A3A5C] leading-relaxed whitespace-pre-wrap">{c.comment}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

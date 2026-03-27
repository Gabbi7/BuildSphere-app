import React, { useState } from 'react';
import { getUserInitials } from '../../utils/taskHelpers';

export default function TaskCommentForm({ user, onSubmit, disabled }) {
    const [text, setText]       = useState('');
    const [loading, setLoading] = useState(false);
    const initials              = getUserInitials(user ? `${user.first_name ?? ''} ${user.last_name ?? ''}` : '?');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        try {
            await onSubmit(text.trim());
            setText('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-3 items-start mt-3">
            <div className="w-7 h-7 rounded-full bg-[#E8E8FF] text-[#5B5BD6] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {initials}
            </div>
            <div className="flex-1 flex gap-2">
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Add a comment…"
                    disabled={disabled || loading}
                    className="flex-1 text-sm px-3 py-2 border border-[#E0E0F0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5BD6]/30 placeholder:text-[#C0C0D8] disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!text.trim() || loading || disabled}
                    className="px-3 py-2 bg-[#5B5BD6] text-white text-xs font-medium rounded-xl hover:bg-[#4747B8] disabled:opacity-40 transition-colors flex-shrink-0"
                >
                    {loading ? '…' : 'Post'}
                </button>
            </div>
        </form>
    );
}

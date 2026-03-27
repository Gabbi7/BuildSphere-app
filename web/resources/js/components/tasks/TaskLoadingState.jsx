import React from 'react';

function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl border border-[#F0F0F8] p-4 animate-pulse space-y-3">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="flex gap-2">
                <div className="h-5 w-14 bg-slate-100 rounded-full" />
                <div className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>
        </div>
    );
}

export default function TaskLoadingState({ view = 'list' }) {
    if (view === 'kanban') {
        return (
            <div className="grid grid-cols-4 gap-4">
                {[0,1,2,3].map(i => (
                    <div key={i} className="bg-[#F8F8FC] rounded-xl p-3 space-y-3">
                        <div className="h-5 bg-slate-100 rounded w-24 animate-pulse" />
                        {[0,1,2].map(j => <SkeletonCard key={j} />)}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {[0,1,2,3,4].map(i => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
        </div>
    );
}

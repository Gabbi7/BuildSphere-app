import React from 'react';
import TaskCard from './TaskCard';
import { TASK_STATUSES } from '../../utils/taskConstants';

const COLUMN_COLORS = {
    todo:        'border-t-red-400',
    in_progress: 'border-t-amber-400',
    in_review:   'border-t-violet-400',
    completed:   'border-t-green-400',
};

export default function TaskKanbanColumn({ status, tasks, onTaskClick }) {
    const cfg      = TASK_STATUSES[status] ?? { label: status };
    const topColor = COLUMN_COLORS[status] ?? 'border-t-gray-300';

    return (
        <div className={`bg-[#F8F8FC] rounded-xl p-3 flex flex-col border-t-[3px] ${topColor}`}>
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`w-2 h-2 rounded-full ${cfg.dot ?? 'bg-gray-400'}`} />
                <span className="text-sm font-bold text-[#1A1A2E]">{cfg.label}</span>
                <span className="ml-auto text-xs font-medium text-[#9090A8] bg-white rounded-full px-2 py-0.5 border border-[#EBEBF5]">
                    {tasks.length}
                </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[600px] pr-0.5">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                ))}
                {tasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-8">
                        <p className="text-xs text-[#C0C0D8] text-center">No tasks here</p>
                    </div>
                )}
            </div>
        </div>
    );
}

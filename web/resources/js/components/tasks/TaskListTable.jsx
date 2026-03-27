import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDate, getUserInitials } from '../../utils/taskHelpers';

export default function TaskListTable({ tasks, onTaskClick }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-[#F0F0F8] bg-white">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-[#F0F0F8] bg-[#FAFAFA]">
                        {['Task Name', 'Project', 'Assigned To', 'Priority', 'Status', 'Start Date', 'Due Date', 'Created By', ''].map(h => (
                            <th key={h} className="text-left text-xs font-semibold text-[#9090A8] px-4 py-3 whitespace-nowrap">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task, i) => {
                        const assignee  = task.assigned_to?.name ?? '—';
                        const createdBy = task.created_by?.name  ?? '—';
                        const initials  = getUserInitials(assignee);

                        return (
                            <tr
                                key={task.id}
                                onClick={() => onTaskClick(task)}
                                className={`border-b border-[#F8F8FC] cursor-pointer hover:bg-[#FAFAFF] transition-colors
                                           ${i % 2 === 0 ? '' : 'bg-[#FDFCFF]'}`}
                            >
                                <td className="px-4 py-3 max-w-[200px]">
                                    <p className="font-medium text-[#1A1A2E] truncate">{task.title}</p>
                                </td>
                                <td className="px-4 py-3">
                                    {task.project ? (
                                        <span className="px-2 py-0.5 bg-[#FFF3CC] text-[#856404] text-xs font-medium rounded-md whitespace-nowrap">
                                            {task.project.name}
                                        </span>
                                    ) : '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-full bg-[#E8E8FF] text-[#5B5BD6] text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                                            {initials}
                                        </div>
                                        <span className="text-[#3A3A5C] text-xs whitespace-nowrap">{assignee}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                                <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                                <td className="px-4 py-3 text-xs text-[#6B6B8D] whitespace-nowrap">{formatDate(task.start_date)}</td>
                                <td className="px-4 py-3 text-xs text-[#6B6B8D] whitespace-nowrap">{formatDate(task.due_date)}</td>
                                <td className="px-4 py-3 text-xs text-[#6B6B8D] whitespace-nowrap">{createdBy}</td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={e => { e.stopPropagation(); onTaskClick(task); }}
                                        className="p-1.5 rounded-lg hover:bg-[#F0F0F8] text-[#9090A8]"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

import React, { useMemo } from 'react';
import TaskKanbanColumn from './TaskKanbanColumn';
import { KANBAN_COLUMNS } from '../../utils/taskConstants';

export default function TaskKanbanBoard({ tasks, onTaskClick }) {
    const grouped = useMemo(() => {
        return KANBAN_COLUMNS.reduce((acc, status) => {
            acc[status] = tasks.filter(t => t.status === status);
            return acc;
        }, {});
    }, [tasks]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {KANBAN_COLUMNS.map(status => (
                <TaskKanbanColumn
                    key={status}
                    status={status}
                    tasks={grouped[status]}
                    onTaskClick={onTaskClick}
                />
            ))}
        </div>
    );
}

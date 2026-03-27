import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import TaskToolbar from '../components/tasks/TaskToolbar';
import TaskProjectTabs from '../components/tasks/TaskProjectTabs';
import TaskListTable from '../components/tasks/TaskListTable';
import TaskKanbanBoard from '../components/tasks/TaskKanbanBoard';
import AddTaskModal from '../components/tasks/AddTaskModal';
import ViewTaskModal from '../components/tasks/ViewTaskModal';
import EmptyTaskState from '../components/tasks/EmptyTaskState';
import TaskLoadingState from '../components/tasks/TaskLoadingState';
import useTasks from '../hooks/useTasks';
import useTaskFilters from '../hooks/useTaskFilters';
import useTaskPermissions from '../hooks/useTaskPermissions';
import useAuth from '../hooks/useAuth';
import { getTaskMeta, updateTaskStatus, createTaskComment, uploadTaskAttachments } from '../services/taskApi';

export default function TasksPage() {
    const { user }        = useAuth();
    const permissions     = useTaskPermissions(user);
    const { tasks, meta, loading, error, fetchTasks, setTasks } = useTasks();

    const {
        search, setSearch,
        sort, setSort,
        filters, setFilter,
        resetFilters, toQueryParams, hasActiveFilters,
    } = useTaskFilters();

    const [view, setView]               = useState('list');
    const [metaData, setMetaData]       = useState(null);
    const [showAddModal, setShowAddModal]= useState(false);
    const [selectedTask, setSelectedTask]= useState(null);
    const [selectedProject, setSelectedProject] = useState('all');

    // Initial data fetch
    const loadTasks = useCallback(() => {
        const queryParams = toQueryParams();
        if (selectedProject !== 'all') {
            queryParams.project_id = selectedProject;
        }
        fetchTasks(queryParams);
    }, [fetchTasks, toQueryParams, selectedProject]);

    useEffect(() => { loadTasks(); }, [search, sort, filters, selectedProject]);

    // Load filter meta once
    useEffect(() => {
        getTaskMeta().then(setMetaData).catch(() => {});
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────────

    const handleStatusChange = useCallback(async (id, status) => {
        try {
            await updateTaskStatus(id, status);
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        } catch {
            toast.error('Failed to update status.');
        }
    }, [setTasks]);

    const handleCommentAdd = useCallback(async (taskId, comment) => {
        try {
            return await createTaskComment(taskId, comment);
        } catch {
            toast.error('Failed to post comment.');
            return null;
        }
    }, []);

    const handleAttachmentUpload = useCallback(async (taskId, fd) => {
        try {
            return await uploadTaskAttachments(taskId, fd);
        } catch {
            toast.error('Upload failed.');
            return null;
        }
    }, []);

    return (
        <DashboardLayout pageTitle="Tasks">
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />

            <div className="space-y-4">
                {/* Toolbar */}
                <div className="bg-white rounded-2xl border border-[#F0F0F8] shadow-sm p-4">
                    <TaskToolbar
                        view={view}
                        onViewChange={setView}
                        search={search}
                        onSearchChange={setSearch}
                        sort={sort}
                        onSortChange={setSort}
                        filters={filters}
                        onFilterChange={setFilter}
                        onResetFilters={resetFilters}
                        hasActiveFilters={hasActiveFilters}
                        meta={metaData}
                        canCreate={permissions.canCreateTask}
                        onAddTask={() => setShowAddModal(true)}
                    />
                </div>

                <TaskProjectTabs 
                    projects={metaData?.projects || []} 
                    selected={selectedProject} 
                    onSelect={setSelectedProject} 
                />

                {/* Content area */}
                <div className="bg-white rounded-2xl border border-[#F0F0F8] shadow-sm p-4">
                    {error ? (
                        <div className="py-16 text-center">
                            <p className="text-sm text-red-500">{error}</p>
                            <button onClick={loadTasks} className="mt-2 text-xs text-[#5B5BD6] hover:underline">Retry</button>
                        </div>
                    ) : loading ? (
                        <TaskLoadingState view={view} />
                    ) : tasks.length === 0 ? (
                        <EmptyTaskState
                            message="No tasks found."
                            canAdd={permissions.canCreateTask}
                            onAdd={() => setShowAddModal(true)}
                        />
                    ) : view === 'list' ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-sm font-bold text-[#1A1A2E]">Task List</h2>
                                {meta && (
                                    <span className="text-xs text-[#9090A8]">{meta.total} task{meta.total !== 1 ? 's' : ''}</span>
                                )}
                            </div>
                            <TaskListTable tasks={tasks} onTaskClick={setSelectedTask} />

                            {/* Pagination */}
                            {meta && meta.last_page > 1 && (
                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <span className="text-xs text-[#9090A8]">
                                        Page {meta.current_page} of {meta.last_page}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <TaskKanbanBoard tasks={tasks} onTaskClick={setSelectedTask} />
                    )}
                </div>
            </div>

            {/* Add Task Modal */}
            {showAddModal && (
                <AddTaskModal
                    user={user}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={loadTasks}
                />
            )}

            {/* View Task Modal */}
            {selectedTask && (
                <ViewTaskModal
                    taskId={selectedTask.id}
                    task={null}
                    user={user}
                    permissions={permissions}
                    onClose={() => setSelectedTask(null)}
                    onStatusChange={handleStatusChange}
                    onCommentAdd={handleCommentAdd}
                    onAttachmentUpload={handleAttachmentUpload}
                />
            )}
        </DashboardLayout>
    );
}

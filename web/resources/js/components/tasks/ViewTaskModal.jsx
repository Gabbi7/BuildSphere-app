import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TaskCommentList from './TaskCommentList';
import TaskCommentForm from './TaskCommentForm';
import TaskAttachmentList from './TaskAttachmentList';
import { formatDate, getUserInitials } from '../../utils/taskHelpers';
import { TASK_STATUSES } from '../../utils/taskConstants';
import { getTaskById } from '../../services/taskApi';
import toast from 'react-hot-toast';

function Section({ title, children }) {
    return (
        <div className="border-t border-[#F0F0F8] pt-4 mt-4">
            <p className="text-xs font-semibold text-[#9090A8] uppercase tracking-wider mb-3">{title}</p>
            {children}
        </div>
    );
}

function Detail({ label, value }) {
    return (
        <div className="flex gap-2 items-start">
            <span className="text-xs text-[#A0A0C0] w-24 flex-shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-[#1A1A2E] font-medium flex-1">{value ?? '—'}</span>
        </div>
    );
}

export default function ViewTaskModal({ taskId, task: initialTask, onClose, permissions, user, onStatusChange, onCommentAdd, onAttachmentUpload }) {
    const [task, setTask]         = useState(initialTask ?? null);
    const [loading, setLoading]  = useState(!initialTask);
    const [comments, setComments]= useState(initialTask?.comments ?? []);
    const [attachments, setAttachments] = useState(initialTask?.attachments ?? []);
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const id = taskId ?? initialTask?.id;

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getTaskById(id).then(data => {
            setTask(data);
            setComments(data.comments ?? []);
            setAttachments(data.attachments ?? []);
        }).catch((err) => {
            if (err.response?.status === 403) {
                toast.error('You do not have permission to view this task.');
            } else {
                toast.error('Failed to load task.');
            }
            onClose();
        }).finally(() => setLoading(false));
    }, [id]);

    const handleStatusChange = async (status) => {
        setShowStatusMenu(false);
        try {
            await onStatusChange(task.id, status);
            setTask(t => ({ ...t, status }));
        } catch { /* toast shown in parent */ }
    };

    const handleComment = async (text) => {
        const comment = await onCommentAdd(task.id, text);
        if (comment) setComments(prev => [...prev, comment]);
    };

    const handleAttachment = async (fd) => {
        const result = await onAttachmentUpload(task.id, fd);
        if (result?.data) setAttachments(prev => [...prev, ...result.data]);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-10 text-center">
                    <div className="w-8 h-8 border-2 border-[#5B5BD6] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-[#9090A8] mt-3">Loading task…</p>
                </div>
            </div>
        );
    }

    if (!task) return null;

    const breadcrumb = [task.project?.name, task.phase?.name, task.milestone?.name].filter(Boolean).join(' / ');
    const assigneeName = task.assigned_to?.name ?? '—';
    const assignedByName = task.assigned_by?.name ?? '—';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
                {/* Modal header */}
                <div className="sticky top-0 bg-white rounded-t-2xl flex items-center gap-3 px-6 py-4 border-b border-[#F0F0F8] z-10">
                    <div className="flex-1 min-w-0">
                        {breadcrumb && (
                            <p className="text-[10px] font-medium text-[#9090A8] truncate mb-1">{breadcrumb}</p>
                        )}

                        {/* Status select + context menu: visible on top bar */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Status selector */}
                            {permissions.canUpdateStatus ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowStatusMenu(s => !s)}
                                        className="flex items-center gap-1"
                                    >
                                        <StatusBadge status={task.status} />
                                        <svg className="w-3 h-3 text-[#9090A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {showStatusMenu && (
                                        <div className="absolute top-full mt-1 left-0 z-20 bg-white border border-[#E0E0F0] rounded-xl shadow-lg py-1 w-40">
                                            {Object.entries(TASK_STATUSES).map(([k, v]) => (
                                                <button
                                                    key={k}
                                                    onClick={() => handleStatusChange(k)}
                                                    className="w-full text-left px-3 py-1.5 text-xs text-[#3A3A5C] hover:bg-[#F8F8FC] flex items-center gap-2"
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
                                                    {v.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <StatusBadge status={task.status} />
                            )}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-[#9090A8] hover:text-[#3A3A5C] p-1.5 rounded-lg hover:bg-[#F0F0F8] flex-shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main body */}
                <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">
                    {/* Left column */}
                    <div>
                        {/* Title and priority */}
                        <div className="flex items-start gap-3 mb-3">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-[#1A1A2E] leading-tight">{task.title}</h2>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex gap-2 mb-4">
                            <svg className="w-4 h-4 text-[#A0A0C0] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            <p className="text-sm text-[#3A3A5C] leading-relaxed whitespace-pre-wrap">{task.description}</p>
                        </div>

                        {/* Comments */}
                        <Section title="Comments">
                            <TaskCommentList comments={comments} />
                            {permissions.canComment && (
                                <TaskCommentForm user={user} onSubmit={handleComment} />
                            )}
                        </Section>

                        {/* Attachments */}
                        <Section title={`Attachments ${attachments.length > 0 ? `(${attachments.length})` : ''}`}>
                            <TaskAttachmentList
                                attachments={attachments}
                                canUpload={permissions.canUploadAttachment}
                                onUpload={handleAttachment}
                            />
                        </Section>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-3">
                        <Detail label="Priority"    value={<PriorityBadge priority={task.priority} />} />
                        <Detail label="Start Date"  value={formatDate(task.start_date)} />
                        <Detail label="Due Date"    value={formatDate(task.due_date)} />
                        <Detail label="Assigned by" value={
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-[#E8E8FF] text-[#5B5BD6] text-[9px] font-bold flex items-center justify-center">
                                    {getUserInitials(assignedByName)}
                                </div>
                                <span className="text-xs">{assignedByName}</span>
                            </div>
                        } />
                        <Detail label="Assigned to" value={
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-[#B8F0D8] text-[#16755A] text-[9px] font-bold flex items-center justify-center">
                                    {getUserInitials(assigneeName)}
                                </div>
                                <span className="text-xs">{assigneeName}</span>
                            </div>
                        } />
                    </div>
                </div>
            </div>
        </div>
    );
}

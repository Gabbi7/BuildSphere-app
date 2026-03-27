import { TASK_STATUSES, TASK_PRIORITIES } from './taskConstants';

export const getStatusConfig = (status) =>
    TASK_STATUSES[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };

export const getPriorityConfig = (priority) =>
    TASK_PRIORITIES[priority] ?? { label: priority, bg: 'bg-gray-100', text: 'text-gray-600' };

export const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
};

export const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs  = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH   = Math.floor(diffMs / 3600000);
    const diffD   = Math.floor(diffMs / 86400000);

    if (diffMin < 1)  return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffH   < 24) return `${diffH}h ago`;
    if (diffD   < 7)  return `${diffD}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getUserInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

export const fileSizeLabel = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const buildTaskFormData = (fields, files = []) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, v);
    });
    files.forEach(f => fd.append('attachments[]', f));
    return fd;
};

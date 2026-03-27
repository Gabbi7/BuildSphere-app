import React from 'react';

const STATUS_MAP = {
    PROPOSED:                      { label: 'Proposed',                   bg: 'bg-blue-100',    text: 'text-blue-700' },
    PENDING_MILESTONES:            { label: 'Pending Milestones',         bg: 'bg-yellow-100',  text: 'text-yellow-700' },
    PENDING_ACCOUNTING_APPROVAL:   { label: 'For Approval',              bg: 'bg-orange-100',  text: 'text-orange-600' },
    PENDING_EXECUTIVE_APPROVAL:    { label: 'For Approval',              bg: 'bg-orange-100',  text: 'text-orange-600' },
    FOR_REVISION:                  { label: 'For Revision',              bg: 'bg-red-100',     text: 'text-red-600' },
    REJECTED:                      { label: 'Rejected',                  bg: 'bg-red-100',     text: 'text-red-700' },
    ONGOING:                       { label: 'Approved',                  bg: 'bg-green-100',   text: 'text-green-700' },
    COMPLETED:                     { label: 'Completed',                 bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

export default function StatusBadge({ status }) {
    const config = STATUS_MAP[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
}

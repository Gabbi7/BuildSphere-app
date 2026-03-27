import React from 'react';
import { getStatusConfig } from '../../utils/taskHelpers';

export default function StatusBadge({ status, size = 'sm' }) {
    const cfg = getStatusConfig(status);
    const px  = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium ${px} ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

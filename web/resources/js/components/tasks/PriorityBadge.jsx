import React from 'react';
import { getPriorityConfig } from '../../utils/taskHelpers';

export default function PriorityBadge({ priority, size = 'sm' }) {
    const cfg = getPriorityConfig(priority);
    const px  = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <span className={`inline-flex items-center rounded-full font-semibold ${px} ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
        </span>
    );
}

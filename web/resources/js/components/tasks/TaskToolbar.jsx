import React, { useRef, useState } from 'react';
import TaskViewToggle from './TaskViewToggle';
import { TASK_STATUSES, TASK_PRIORITIES, SORT_OPTIONS } from '../../utils/taskConstants';

export default function TaskToolbar({
    view, onViewChange,
    search, onSearchChange,
    sort, onSortChange,
    filters, onFilterChange,
    onResetFilters, hasActiveFilters,
    meta,
    canCreate, onAddTask,
}) {
    const [showSort, setShowSort]         = useState(false);
    const [showFilter, setShowFilter]     = useState(false);
    const debounceRef                     = useRef(null);

    const handleSearch = (e) => {
        const val = e.target.value;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => onSearchChange(val), 350);
    };

    return (
        <div className="space-y-3">
            {/* Top row */}
            <div className="flex flex-wrap items-center gap-3">
                <TaskViewToggle view={view} onChange={onViewChange} />

                {/* Search */}
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        id="task-search-input"
                        type="text"
                        defaultValue={search}
                        onChange={handleSearch}
                        placeholder="Search tasks…"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E0E0F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5BD6]/30 placeholder:text-[#C0C0D8]"
                    />
                </div>

                {/* Sort dropdown */}
                <div className="relative">
                    <button
                        id="task-sort-btn"
                        onClick={() => { setShowSort(s => !s); setShowFilter(false); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#6B6B8D] bg-white border border-[#E0E0F0] rounded-xl hover:bg-[#F8F8FC] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                        Sort by
                    </button>
                    {showSort && (
                        <div className="absolute top-full mt-2 left-0 z-30 bg-white border border-[#E0E0F0] rounded-xl shadow-lg py-1 w-52">
                            {SORT_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => { onSortChange(opt.value); setShowSort(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors
                                        ${sort === opt.value ? 'bg-[#F0F0FE] text-[#5B5BD6] font-medium' : 'text-[#3A3A5C] hover:bg-[#F8F8FC]'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Filter button */}
                <button
                    id="task-filter-btn"
                    onClick={() => { setShowFilter(s => !s); setShowSort(false); }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-xl transition-colors
                        ${hasActiveFilters
                            ? 'bg-[#5B5BD6] text-white border-[#5B5BD6]'
                            : 'text-[#6B6B8D] bg-white border-[#E0E0F0] hover:bg-[#F8F8FC]'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    Filter {hasActiveFilters && '•'}
                </button>

                <div className="ml-auto">
                    {canCreate && (
                        <button
                            id="task-add-new-btn"
                            onClick={onAddTask}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#5B5BD6] text-white text-sm font-semibold rounded-xl
                                       hover:bg-[#4747B8] active:scale-95 transition-all shadow-md shadow-[#5B5BD6]/20"
                        >
                            + Add new
                        </button>
                    )}
                </div>
            </div>

            {/* Filter panel */}
            {showFilter && (
                <div className="bg-white border border-[#E0E0F0] rounded-xl p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

                        {/* Assigned To */}
                        <div>
                            <label className="text-xs font-medium text-[#6B6B8D] mb-1 block">Assigned To</label>
                            <select
                                value={filters.assigned_to}
                                onChange={e => onFilterChange('assigned_to', e.target.value)}
                                className="w-full text-xs border border-[#E0E0F0] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5BD6]/30"
                            >
                                <option value="">All</option>
                                {meta?.users?.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="text-xs font-medium text-[#6B6B8D] mb-1 block">Priority</label>
                            <select
                                value={filters.priority}
                                onChange={e => onFilterChange('priority', e.target.value)}
                                className="w-full text-xs border border-[#E0E0F0] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5BD6]/30"
                            >
                                <option value="">All</option>
                                {Object.entries(TASK_PRIORITIES).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="text-xs font-medium text-[#6B6B8D] mb-1 block">Status</label>
                            <select
                                value={filters.status}
                                onChange={e => onFilterChange('status', e.target.value)}
                                className="w-full text-xs border border-[#E0E0F0] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5BD6]/30"
                            >
                                <option value="">All</option>
                                {Object.entries(TASK_STATUSES).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* From Date */}
                        <div>
                            <label className="text-xs font-medium text-[#6B6B8D] mb-1 block">From</label>
                            <input
                                type="date"
                                value={filters.start_date}
                                onChange={e => onFilterChange('start_date', e.target.value)}
                                className="w-full text-xs border border-[#E0E0F0] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5BD6]/30"
                            />
                        </div>

                        {/* To Date */}
                        <div>
                            <label className="text-xs font-medium text-[#6B6B8D] mb-1 block">To</label>
                            <input
                                type="date"
                                value={filters.end_date}
                                onChange={e => onFilterChange('end_date', e.target.value)}
                                className="w-full text-xs border border-[#E0E0F0] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B5BD6]/30"
                            />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={onResetFilters}
                            className="mt-3 text-xs text-[#5B5BD6] hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

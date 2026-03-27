import React from 'react';

export default function MilestoneRowForm({ index, milestone, onChange, onRemove, error }) {
    const handleFieldChange = (field, value) => {
        onChange(index, field, value);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end w-full">
            {/* Milestone Name */}
            <div className="flex-1 space-y-1">
                <label className="block text-xs font-semibold text-[#1A1A1A] ml-1">
                    Milestone {index + 1} Name
                </label>
                <input
                    type="text"
                    value={milestone.milestone_name}
                    onChange={(e) => handleFieldChange('milestone_name', e.target.value)}
                    placeholder="e.g. Shop Drawings"
                    className={`w-full rounded-xl border px-4 py-3 text-sm ${
                        error?.milestone_name ? 'border-red-400 focus:ring-red-200' : 'border-[#E8E8FF] focus:border-[#706BFF] focus:ring-[#706BFF]/20'
                    } focus:outline-none focus:ring-2`}
                />
                {error?.milestone_name && <p className="text-red-500 text-xs ml-1">{error.milestone_name}</p>}
            </div>

            {/* Start Date */}
            <div className="w-full lg:w-40 space-y-1">
                <label className="block text-xs font-semibold text-[#1A1A1A] ml-1">
                    Milestone Start
                </label>
                <input
                    type="date"
                    value={milestone.start_date}
                    onChange={(e) => handleFieldChange('start_date', e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-[#5A5A5A] ${
                        error?.start_date ? 'border-red-400 focus:ring-red-200' : 'border-[#E8E8FF] focus:border-[#706BFF] focus:ring-[#706BFF]/20'
                    } focus:outline-none focus:ring-2`}
                />
                {error?.start_date && <p className="text-red-500 text-xs ml-1">{error.start_date}</p>}
            </div>

            {/* End Date */}
            <div className="w-full lg:w-40 space-y-1">
                <label className="block text-xs font-semibold text-[#1A1A1A] ml-1">
                    Milestone End
                </label>
                <input
                    type="date"
                    value={milestone.end_date}
                    onChange={(e) => handleFieldChange('end_date', e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-[#5A5A5A] ${
                        error?.end_date ? 'border-red-400 focus:ring-red-200' : 'border-[#E8E8FF] focus:border-[#706BFF] focus:ring-[#706BFF]/20'
                    } focus:outline-none focus:ring-2`}
                />
                {error?.end_date && <p className="text-red-500 text-xs ml-1">{error.end_date}</p>}
            </div>
            
            {/* Has Quantity Toggle */}
            <div className="flex flex-col items-center justify-end pb-3 space-y-2">
                <label className="block text-xs font-semibold text-[#1A1A1A]">With Qty?</label>
                <input
                    type="checkbox"
                    checked={milestone.has_quantity}
                    onChange={(e) => handleFieldChange('has_quantity', e.target.checked)}
                    className="w-5 h-5 rounded border-[#E8E8FF] text-[#706BFF] focus:ring-[#706BFF]/30"
                />
            </div>

            {/* Target Quantity (Conditional) */}
            {milestone.has_quantity && (
                <div className="w-full lg:w-32 space-y-1">
                    <label className="block text-xs font-semibold text-[#1A1A1A] ml-1">
                        Quantity
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={milestone.quantity_target || ''}
                        onChange={(e) => handleFieldChange('quantity_target', e.target.value)}
                        placeholder="0.00"
                        className={`w-full rounded-xl border px-4 py-3 text-sm ${
                            error?.quantity_target ? 'border-red-400 focus:ring-red-200' : 'border-[#E8E8FF] focus:border-[#706BFF] focus:ring-[#706BFF]/20'
                        } focus:outline-none focus:ring-2`}
                    />
                    {error?.quantity_target && <p className="text-red-500 text-xs ml-1">{error.quantity_target}</p>}
                </div>
            )}

            {/* Remove Button */}
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors mb-1 lg:mb-0"
                title="Remove Milestone"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            {error?.general && <p className="text-red-500 text-xs ml-1 w-full lg:w-auto">{error.general}</p>}
        </div>
    );
}

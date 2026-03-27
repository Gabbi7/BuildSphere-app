import React from 'react';
import PhaseTitleSelect from './PhaseTitleSelect';
import MilestoneRowForm from './MilestoneRowForm';

export default function MilestonePhaseCard({ 
    phaseIndex, 
    phase, 
    onChange, 
    onAddMilestone, 
    onRemoveMilestone, 
    onMilestoneChange,
    errors = {} 
}) {
    const handlePhaseChange = (field, value) => {
        onChange(phaseIndex, field, value);
    };

    return (
        <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-[#E8E8FF]">
            {/* Phase Header Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1 relative">
                    <label className="block text-xs font-semibold text-[#1A1A1A] ml-1">
                        Phase {phaseIndex + 1} Title
                    </label>
                    <PhaseTitleSelect
                        value={phase.phase_key}
                        onChange={(e) => handlePhaseChange('phase_key', e.target.value)}
                        error={errors.phase_key}
                    />
                </div>

                <div className="space-y-1 relative">
                    <label className="block text-xs font-semibold text-[#1A1A1A] ml-1">
                        Weight
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={phase.weight_percentage}
                            onChange={(e) => handlePhaseChange('weight_percentage', e.target.value)}
                            className={`w-full rounded-xl border px-4 py-3 pr-8 text-sm ${
                                errors.weight_percentage ? 'border-red-400 focus:ring-red-200' : 'border-[#E8E8FF] focus:border-[#706BFF] focus:ring-[#706BFF]/20'
                            } focus:outline-none focus:ring-2`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">%</span>
                    </div>
                    {errors.weight_percentage && <p className="text-red-500 text-xs ml-1 absolute">{errors.weight_percentage}</p>}
                </div>

                <div className="space-y-1 relative">
                    <label className="block text-xs font-semibold text-[#1A1A1A] ml-1">
                        Phase Start
                    </label>
                    <input
                        type="date"
                        value={phase.start_date}
                        onChange={(e) => handlePhaseChange('start_date', e.target.value)}
                        className={`w-full rounded-xl border px-4 py-3 text-sm text-[#5A5A5A] ${
                            errors.start_date ? 'border-red-400 focus:ring-red-200' : 'border-[#E8E8FF] focus:border-[#706BFF] focus:ring-[#706BFF]/20'
                        } focus:outline-none focus:ring-2`}
                    />
                    {errors.start_date && <p className="text-red-500 text-xs ml-1 absolute">{errors.start_date}</p>}
                </div>

                <div className="space-y-1 relative">
                    <label className="block text-xs font-semibold text-[#1A1A1A] ml-1">
                        Phase End
                    </label>
                    <input
                        type="date"
                        value={phase.end_date}
                        onChange={(e) => handlePhaseChange('end_date', e.target.value)}
                        className={`w-full rounded-xl border px-4 py-3 text-sm text-[#5A5A5A] ${
                            errors.end_date ? 'border-red-400 focus:ring-red-200' : 'border-[#E8E8FF] focus:border-[#706BFF] focus:ring-[#706BFF]/20'
                        } focus:outline-none focus:ring-2`}
                    />
                    {errors.end_date && <p className="text-red-500 text-xs ml-1 absolute">{errors.end_date}</p>}
                </div>
            </div>

            {/* Milestones List */}
            <div className="space-y-4">
                {phase.milestones.map((milestone, msIndex) => (
                    <MilestoneRowForm
                        key={msIndex}
                        index={msIndex}
                        milestone={milestone}
                        onChange={(idx, field, val) => onMilestoneChange(phaseIndex, idx, field, val)}
                        onRemove={(idx) => onRemoveMilestone(phaseIndex, idx)}
                        error={errors.milestones?.[msIndex]}
                    />
                ))}
            </div>

            {/* Add Milestone Button */}
            <div className="mt-4 flex justify-center">
                <button
                    type="button"
                    onClick={() => onAddMilestone(phaseIndex)}
                    className="text-[#706BFF] text-sm font-medium hover:underline flex items-center gap-1"
                >
                    Add one more milestone
                </button>
            </div>
            
            {errors.general && <p className="text-red-500 text-xs mt-3 text-center">{errors.general}</p>}
        </div>
    );
}

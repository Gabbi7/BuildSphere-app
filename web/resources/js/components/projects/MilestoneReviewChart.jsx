import React from 'react';

export default function MilestoneReviewChart({ data }) {
    if (!data || !data.phases || data.phases.length === 0) {
        return <div className="p-8 text-center text-gray-500">No milestone data available to display.</div>;
    }

    const { timeline_months, phases } = data;

    return (
        <div className="w-full overflow-x-auto rounded-xl border border-[#E8E8FF]">
            <table className="w-full text-left border-collapse">
                <thead className="bg-[#FAFAFA] text-xs font-semibold text-[#5A5A5A] whitespace-nowrap">
                    <tr>
                        <th className="p-4 border-b border-r border-[#E8E8FF] min-w-[200px]">Project Phase</th>
                        <th className="p-4 border-b border-r border-[#E8E8FF] min-w-[200px]">Milestone</th>
                        {timeline_months.map((month) => (
                            <th key={month.key} className="p-4 text-center border-b border-r border-[#E8E8FF] min-w-[100px]">
                                {month.label} {month.year !== timeline_months[0]?.year ? month.year : ''}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {phases.map((phase) => (
                        <React.Fragment key={phase.id}>
                            {/* Phase Row */}
                            <tr className="bg-[#F8F9FA] font-semibold text-[#1A1A1A]">
                                <td colSpan={2} className="p-4 border-b border-r border-[#E8E8FF]">
                                    {phase.phase_title} ({phase.weight_percentage}%)
                                </td>
                                {timeline_months.map((month) => {
                                    // Check if phase spans this month (rough check for visual phase bar)
                                    const pStart = phase.start_date.substring(0, 7);
                                    const pEnd = phase.end_date.substring(0, 7);
                                    const isSpan = month.key >= pStart && month.key <= pEnd;
                                    return (
                                        <td key={`${phase.id}-${month.key}`} className="p-0 border-b border-r border-[#E8E8FF] h-12">
                                            {isSpan && (
                                                <div className="h-full w-full bg-[#E8E8FF] opacity-30"></div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                            
                            {/* Milestone Rows */}
                            {phase.milestones.map((ms) => (
                                <tr key={ms.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 border-b border-r border-[#E8E8FF] text-gray-400 pl-8">
                                        ↳
                                    </td>
                                    <td className="p-4 border-b border-r border-[#E8E8FF] text-[#1A1A1A]">
                                        {ms.milestone_name} 
                                        {ms.has_quantity && ms.quantity_target && (
                                            <span className="ml-2 text-xs text-[#706BFF] bg-[#E8E8FF] px-2 py-0.5 rounded-full">
                                                Qty: {ms.quantity_target}
                                            </span>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            {ms.start_date} to {ms.end_date}
                                        </div>
                                    </td>
                                    {timeline_months.map((month) => {
                                        const isSpan = ms.month_spans.includes(month.key);
                                        return (
                                            <td key={`${ms.id}-${month.key}`} className="p-2 border-b border-r border-[#E8E8FF] h-16">
                                                {isSpan && (
                                                    <div className="h-full w-full bg-[#706BFF] rounded-md shadow-sm opacity-90 transition-opacity hover:opacity-100 flex items-center justify-center">
                                                        <span className="text-white text-xs opacity-0 hover:opacity-100 cursor-default px-1 text-center leading-tight">
                                                            {ms.milestone_name}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

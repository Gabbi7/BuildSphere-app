import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuth from '../hooks/useAuth';
import { getProject, getMilestones, storeMilestones } from '../services/projectApi';

const emptyMilestone = () => ({
    milestone_name: '',
    description: '',
    start_date: '',
    end_date: '',
    weight_percentage: '',
    target_quantity: '',
    sequence_no: 1,
});

export default function ProjectMilestonesPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [milestones, setMilestones] = useState([emptyMilestone()]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getProject(id), getMilestones(id)])
            .then(([projRes, msRes]) => {
                const p = projRes.data.data || projRes.data;
                setProject(p);
                const existing = msRes.data.data || msRes.data;
                if (existing.length > 0) {
                    setMilestones(existing.map((m, i) => ({
                        milestone_name: m.milestone_name,
                        description: m.description || '',
                        start_date: m.start_date || '',
                        end_date: m.end_date || '',
                        weight_percentage: m.weight_percentage,
                        target_quantity: m.target_quantity || '',
                        sequence_no: m.sequence_no || i + 1,
                    })));
                }
            })
            .catch(() => navigate('/projects'))
            .finally(() => setLoading(false));
    }, [id]);

    const updateMilestone = (index, field, value) => {
        setMilestones((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
    };

    const addRow = () => {
        setMilestones((prev) => [...prev, { ...emptyMilestone(), sequence_no: prev.length + 1 }]);
    };

    const removeRow = (index) => {
        if (milestones.length <= 1) return;
        setMilestones((prev) => prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, sequence_no: i + 1 })));
    };

    const totalWeight = milestones.reduce((sum, m) => sum + (parseFloat(m.weight_percentage) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const payload = milestones.map((m, i) => ({
                ...m,
                weight_percentage: parseFloat(m.weight_percentage) || 0,
                target_quantity: m.target_quantity ? parseFloat(m.target_quantity) : null,
                sequence_no: i + 1,
            }));
            await storeMilestones(id, payload);
            navigate(`/projects/${id}`);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrors({ milestones: [err.response?.data?.message || 'Something went wrong.'] });
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout pageTitle="Milestones">
                <div className="text-center py-16 text-[#A1A1A1] text-sm">Loading...</div>
            </DashboardLayout>
        );
    }

    const inputClass = 'w-full rounded-xl border border-[#E8E8FF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#706BFF]/20 focus:border-[#706BFF] placeholder:text-[#C1C1C1]';

    return (
        <DashboardLayout pageTitle={
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/projects/${id}`)} className="text-[#1A1A1A] hover:text-[#706BFF] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span>Milestones</span>
            </div>
        }>
            <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F8] p-8">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-[#706BFF]">Manage Milestones</h2>
                    <p className="text-sm text-[#A1A1A1]">{project?.project_name} — Define project milestones (total weight must equal 100%)</p>
                </div>

                {errors.milestones && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
                        {Array.isArray(errors.milestones) ? errors.milestones[0] : errors.milestones}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {milestones.map((m, i) => (
                            <div key={i} className="border border-[#F0F0F8] rounded-xl p-4 relative">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-[#706BFF]">Milestone {i + 1}</span>
                                    {milestones.length > 1 && (
                                        <button type="button" onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Name</label>
                                        <input type="text" value={m.milestone_name} onChange={(e) => updateMilestone(i, 'milestone_name', e.target.value)}
                                               placeholder="Milestone name" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Start Date</label>
                                        <input type="date" value={m.start_date} onChange={(e) => updateMilestone(i, 'start_date', e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">End Date</label>
                                        <input type="date" value={m.end_date} onChange={(e) => updateMilestone(i, 'end_date', e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Weight %</label>
                                        <input type="number" step="0.01" value={m.weight_percentage} onChange={(e) => updateMilestone(i, 'weight_percentage', e.target.value)}
                                               placeholder="0" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Target Qty</label>
                                        <input type="number" step="0.01" value={m.target_quantity} onChange={(e) => updateMilestone(i, 'target_quantity', e.target.value)}
                                               placeholder="Optional" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Description</label>
                                        <input type="text" value={m.description} onChange={(e) => updateMilestone(i, 'description', e.target.value)}
                                               placeholder="Optional" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <button type="button" onClick={addRow}
                                className="text-[#706BFF] text-sm font-semibold hover:underline">
                            + Add Milestone
                        </button>
                        <span className={`text-sm font-semibold ${Math.abs(totalWeight - 100) < 0.01 ? 'text-green-600' : 'text-red-500'}`}>
                            Total: {totalWeight.toFixed(2)}%
                        </span>
                    </div>

                    <button type="submit" disabled={saving}
                            className="w-full mt-6 bg-[#706BFF] hover:bg-[#5B55E6] disabled:opacity-60 text-white
                                       font-bold py-3.5 rounded-2xl transition-all shadow-[0_8px_25px_rgba(112,107,255,0.3)]">
                        {saving ? 'Submitting...' : 'Submit Milestones'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}

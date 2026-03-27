import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/projects/StatusBadge';
import useAuth from '../hooks/useAuth';
import { getProject, getMilestoneChart, submitAccountingApproval, submitExecutiveApproval } from '../services/projectApi';
import MilestoneReviewChart from '../components/projects/MilestoneReviewChart';

export default function ProjectApprovalPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [comments, setComments] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([getProject(id), getMilestoneChart(id)])
            .then(([projRes, chartRes]) => {
                setProject(projRes.data.data || projRes.data);
                setChartData(chartRes.data);
            })
            .catch(() => navigate('/projects'))
            .finally(() => setLoading(false));
    }, [id]);

    const isAccounting = user?.role === 'Accounting' && project?.status === 'PENDING_ACCOUNTING_APPROVAL';
    const isExecutive = ['CEO', 'COO'].includes(user?.role) && project?.status === 'PENDING_EXECUTIVE_APPROVAL';

    const handleApprove = async () => {
        setSubmitting(true);
        setError('');
        try {
            const fn = isAccounting ? submitAccountingApproval : submitExecutiveApproval;
            await fn(id, { decision: 'APPROVED', comments: '' });
            navigate(`/projects/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!comments.trim()) {
            setError('Please provide a reason for rejection.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const fn = isAccounting ? submitAccountingApproval : submitExecutiveApproval;
            await fn(id, { decision: 'REJECTED', comments });
            navigate(`/projects/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout pageTitle="Review Project">
                <div className="text-center py-16 text-[#A1A1A1] text-sm">Loading...</div>
            </DashboardLayout>
        );
    }

    const formatCurrency = (val) =>
        val != null ? `₱ ${Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—';

    return (
        <DashboardLayout pageTitle={
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/projects/${id}`)} className="text-[#1A1A1A] hover:text-[#706BFF] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span>Review Project</span>
            </div>
        }>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Project summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F8] p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-[#1A1A1A]">{project.project_name}</h2>
                            <p className="text-sm text-[#6B6B6B]">{project.client_name} · {project.project_code}</p>
                        </div>
                        <StatusBadge status={project.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><span className="text-[#A1A1A1]">Contract Price</span><p className="font-medium">{formatCurrency(project.contract_price)}</p></div>
                        <div><span className="text-[#A1A1A1]">Budget</span><p className="font-medium">{formatCurrency(project.budget_for_materials)}</p></div>
                        <div><span className="text-[#A1A1A1]">Duration</span><p className="font-medium">{project.start_date} to {project.end_date}</p></div>
                    </div>
                </div>

                {/* Milestone Chart */}
                {chartData && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F8] p-6 overflow-hidden">
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-sm font-bold text-[#706BFF]">Milestone Plan & Schedule</h3>
                            <div className="text-xs text-[#6B6B6B] text-right">
                                Submitted By: <span className="font-semibold text-[#1A1A1A]">{chartData.submitted_by || '—'}</span><br/>
                                {chartData.submitted_at ? new Date(chartData.submitted_at).toLocaleString('en-US') : '—'}
                            </div>
                        </div>
                        <MilestoneReviewChart data={chartData} />
                    </div>
                )}

                {/* Approval History */}
                {chartData?.approval_history?.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F8] p-6">
                        <h3 className="text-sm font-bold text-[#706BFF] mb-4">Approval History</h3>
                        <div className="space-y-4">
                            {chartData.approval_history.map((hist, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border ${hist.decision === 'APPROVED' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-semibold text-[#1A1A1A] text-sm">
                                            {hist.stage} Review
                                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${hist.decision === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {hist.decision}
                                            </span>
                                        </div>
                                        <div className="text-xs text-[#6B6B6B]">
                                            {hist.decided_at ? new Date(hist.decided_at).toLocaleString('en-US') : '—'}
                                        </div>
                                    </div>
                                    <div className="text-sm text-[#5A5A5A]">
                                        <span className="font-medium">Approver:</span> {hist.approver_name || 'System / Unknown'}
                                    </div>
                                    {hist.comments && (
                                        <div className="text-sm mt-2 text-[#5A5A5A] italic w-full">
                                            &ldquo;{hist.comments}&rdquo;
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Approval actions */}
                {(isAccounting || isExecutive) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F8] p-6">
                        <h3 className="text-sm font-bold text-[#706BFF] mb-4">Approval Decision</h3>

                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        {!showRejectModal ? (
                            <div className="flex gap-3">
                                <button onClick={handleApprove} disabled={submitting}
                                        className="px-8 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
                                    {submitting ? 'Processing...' : 'Approve'}
                                </button>
                                <button onClick={() => setShowRejectModal(true)} disabled={submitting}
                                        className="px-8 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60">
                                    Reject
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Please provide the reason for rejection..."
                                    rows="3"
                                    className="w-full rounded-xl border border-[#E8E8FF] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                                />
                                <div className="flex gap-3">
                                    <button onClick={handleReject} disabled={submitting}
                                            className="px-6 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 disabled:opacity-60">
                                        {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                                    </button>
                                    <button onClick={() => { setShowRejectModal(false); setComments(''); }}
                                            className="px-6 py-2.5 border border-[#E8E8FF] text-[#6B6B6B] text-sm font-semibold rounded-xl hover:bg-[#F5F5FA]">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

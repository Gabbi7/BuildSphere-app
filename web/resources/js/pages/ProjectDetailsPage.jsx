import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/projects/StatusBadge';
import useAuth from '../hooks/useAuth';
import { getProject } from '../services/projectApi';

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProject(id)
            .then((res) => setProject(res.data.data || res.data))
            .catch((err) => {
                console.error('Failed to load project:', err);
                navigate('/projects');
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout pageTitle="Project Details">
                <div className="text-center py-16 text-[#A1A1A1] text-sm">Loading project...</div>
            </DashboardLayout>
        );
    }

    if (!project) return null;

    const formatCurrency = (val) =>
        val != null ? `₱ ${Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—';

    return (
        <DashboardLayout pageTitle={
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/projects')} className="text-[#1A1A1A] hover:text-[#706BFF] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span>Project Details</span>
            </div>
        }>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header card */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F8] p-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs text-[#A1A1A1] mb-1">{project.project_code}</p>
                            <h2 className="text-xl font-bold text-[#1A1A1A]">{project.project_name}</h2>
                            <p className="text-sm text-[#6B6B6B] mt-1">{project.client_name}</p>
                        </div>
                        <StatusBadge status={project.status} />
                    </div>

                    {project.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                            <p className="text-sm font-semibold text-red-700 mb-1">Rejection Reason</p>
                            <p className="text-sm text-red-600">{project.rejection_reason}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-[#A1A1A1]">Address</span>
                            <p className="font-medium text-[#1A1A1A]">{project.address}</p>
                        </div>
                        <div>
                            <span className="text-[#A1A1A1]">Contract Price</span>
                            <p className="font-medium text-[#1A1A1A]">{formatCurrency(project.contract_price)}</p>
                        </div>
                        <div>
                            <span className="text-[#A1A1A1]">Unit Price</span>
                            <p className="font-medium text-[#1A1A1A]">{formatCurrency(project.contract_unit_price)}</p>
                        </div>
                        <div>
                            <span className="text-[#A1A1A1]">Budget for Materials</span>
                            <p className="font-medium text-[#1A1A1A]">{formatCurrency(project.budget_for_materials)}</p>
                        </div>
                        <div>
                            <span className="text-[#A1A1A1]">Start Date</span>
                            <p className="font-medium text-[#1A1A1A]">{project.start_date}</p>
                        </div>
                        <div>
                            <span className="text-[#A1A1A1]">End Date</span>
                            <p className="font-medium text-[#1A1A1A]">{project.end_date}</p>
                        </div>
                        <div>
                            <span className="text-[#A1A1A1]">Created By</span>
                            <p className="font-medium text-[#1A1A1A]">{project.created_by?.name || '—'}</p>
                        </div>
                        <div>
                            <span className="text-[#A1A1A1]">Project-in-Charge</span>
                            <p className="font-medium text-[#1A1A1A]">{project.project_in_charge?.name || '—'}</p>
                        </div>
                    </div>

                    {project.description && (
                        <div className="mt-4 text-sm">
                            <span className="text-[#A1A1A1]">Description</span>
                            <p className="font-medium text-[#1A1A1A] mt-1">{project.description}</p>
                        </div>
                    )}
                </div>

                {/* Action buttons based on role */}
                <div className="flex gap-3">
                    {user?.role === 'Project Engineer' && ['PROPOSED', 'PENDING_MILESTONES', 'FOR_REVISION'].includes(project.status) && (
                        <button
                            onClick={() => navigate(`/projects/${project.id}/milestone-input`)}
                            className="px-6 py-2.5 bg-[#706BFF] text-white text-sm font-bold rounded-xl hover:bg-[#5B55E6] transition-colors"
                        >
                            Manage Milestone Plan
                        </button>
                    )}
                    {user?.role === 'Accounting' && project.status === 'PENDING_ACCOUNTING_APPROVAL' && (
                        <button
                            onClick={() => navigate(`/projects/${project.id}/approval`)}
                            className="px-6 py-2.5 bg-[#706BFF] text-white text-sm font-bold rounded-xl hover:bg-[#5B55E6] transition-colors"
                        >
                            Review & Approve
                        </button>
                    )}
                    {['CEO', 'COO'].includes(user?.role) && project.status === 'PENDING_EXECUTIVE_APPROVAL' && (
                        <button
                            onClick={() => navigate(`/projects/${project.id}/approval`)}
                            className="px-6 py-2.5 bg-[#706BFF] text-white text-sm font-bold rounded-xl hover:bg-[#5B55E6] transition-colors"
                        >
                            Review & Approve
                        </button>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

export default function ProjectSuccessPage() {
    const navigate = useNavigate();

    return (
        <DashboardLayout pageTitle={
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/projects')} className="text-[#1A1A1A] hover:text-[#706BFF] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span>New Project</span>
            </div>
        }>
            <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F8] p-10 md:p-16">
                <div className="flex flex-col items-center justify-center text-center">
                    {/* Purple circle with checkmark */}
                    <div className="w-32 h-32 rounded-full bg-[#706BFF] flex items-center justify-center mb-8
                                    shadow-[0_12px_40px_rgba(112,107,255,0.35)]">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Project Saved!</h2>
                    <p className="text-[#A1A1A1] text-sm mb-8">
                        Project is now proposed. Its now ready for milestone input
                    </p>

                    <button
                        onClick={() => navigate('/projects')}
                        className="px-10 py-3 bg-[#706BFF] hover:bg-[#5B55E6] text-white font-bold
                                   rounded-2xl transition-all shadow-[0_8px_25px_rgba(112,107,255,0.3)]
                                   active:scale-[0.98]"
                    >
                        Back to Projects
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}

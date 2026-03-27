import React from 'react';
import { Link, useParams } from 'react-router-dom';

export default function EngineerMilestoneSuccessPage() {
    return (
        <div className="flex-1 bg-white flex items-center justify-center p-8">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-24 h-24 bg-[#E8E8FF] rounded-full flex items-center justify-center mx-auto text-[#706BFF] mb-6 shadow-sm">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                
                <h1 className="text-3xl font-bold text-[#1A1A1A]">Milestones Saved!</h1>
                <p className="text-[#5A5A5A]">
                    The milestone plan has been successfully submitted and is now pending Accouting validation.
                </p>
                
                <div className="pt-8">
                    <Link
                        to="/projects"
                        className="inline-block px-8 py-3 rounded-xl bg-[#706BFF] text-white font-medium hover:bg-[#5C57E6] transition-colors shadow-sm"
                    >
                        Back to Projects
                    </Link>
                </div>
            </div>
        </div>
    );
}

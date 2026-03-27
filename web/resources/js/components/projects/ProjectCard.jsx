import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function ProjectCard({ project }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/projects/${project.id}`)}
            className="bg-white rounded-2xl border border-[#F0F0F8] shadow-sm overflow-hidden cursor-pointer
                       hover:shadow-md hover:border-[#E0DFFF] transition-all group"
        >
            {/* Placeholder image area */}
            <div className="h-40 bg-pink-100 group-hover:bg-pink-50 transition-colors" />

            {/* Card footer */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-sm font-bold text-[#1A1A1A] truncate">{project.project_name}</span>
                    </div>
                    <StatusBadge status={project.status} />
                </div>
                <p className="text-xs text-[#A1A1A1] mt-1 ml-10">{project.client_name}</p>
            </div>
        </div>
    );
}

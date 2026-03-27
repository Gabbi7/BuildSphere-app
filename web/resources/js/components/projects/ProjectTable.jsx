import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function ProjectTable({ projects }) {
    const navigate = useNavigate();

    if (!projects.length) {
        return (
            <div className="text-center py-12 text-[#A1A1A1] text-sm">
                No projects found.
            </div>
        );
    }

    return (
        <table className="w-full">
            <thead>
                <tr className="text-left text-sm font-semibold text-[#A1A1A1] border-b border-[#F0F0F8]">
                    <th className="pb-3 pl-4">Name</th>
                    <th className="pb-3">Made By</th>
                    <th className="pb-3">Client</th>
                    <th className="pb-3">Date Created</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-4"></th>
                </tr>
            </thead>
            <tbody>
                {projects.map((project) => (
                    <tr
                        key={project.id}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="border-b border-[#F8F8FC] hover:bg-[#FAFAFF] cursor-pointer transition-colors"
                    >
                        <td className="py-4 pl-4 text-sm font-medium text-[#1A1A1A]">{project.project_name}</td>
                        <td className="py-4 text-sm text-[#6B6B6B]">{project.created_by?.name || '—'}</td>
                        <td className="py-4 text-sm text-[#6B6B6B]">{project.client_name}</td>
                        <td className="py-4 text-sm text-[#6B6B6B]">{project.created_at}</td>
                        <td className="py-4"><StatusBadge status={project.status} /></td>
                        <td className="py-4 pr-4 text-right">
                            <svg className="w-4 h-4 text-[#C1C1C1] inline" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

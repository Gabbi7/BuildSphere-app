import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import ProjectTeamCard from '../components/dashboard/ProjectTeamCard';
import OngoingProjectRow from '../components/dashboard/OngoingProjectRow';
import ProjectUpdateCard from '../components/dashboard/ProjectUpdateCard';
import { getDashboardStats } from '../services/dashboardApi';
import { useState, useEffect } from 'react';

const avatarColors = ['#706BFF', '#F59E0B', '#10B981', '#EF4444'];
const mockMembers = [
    { initials: 'IV', color: '#706BFF' },
    { initials: 'MR', color: '#EC4899' },
    { initials: 'GR', color: '#10B981' },
    { initials: 'SO', color: '#F59E0B' },
];

const teams = [
    { tasksDone: 26, tasksTotal: 50, memberCount: 4, members: mockMembers },
    { tasksDone: 26, tasksTotal: 50, memberCount: 4, members: mockMembers },
    { tasksDone: 26, tasksTotal: 50, memberCount: 4, members: mockMembers },
    { tasksDone: 26, tasksTotal: 50, memberCount: 4, members: mockMembers },
];

const ongoingProjects = [
    { status: 'On Track', progress: 20, daysLeft: 128 },
    { status: 'Delayed',  progress: 38, daysLeft: 42 },
    { status: 'Near Due', progress: 65, daysLeft: 12 },
];

const projectUpdates = [0, 0, 0, 0];

export default function DashboardPage() {
    const [statsData, setStatsData] = useState({
        ongoing_projects_count: 0,
        proposed_projects_count: 0,
        completed_projects_count: 0,
    });

    useEffect(() => {
        getDashboardStats()
            .then(setStatsData)
            .catch(err => console.error('Failed to fetch dashboard stats:', err));
    }, []);

    const stats = [
        { label: 'Ongoing Projects',   value: statsData.ongoing_projects_count,  color: 'text-orange-400' },
        { label: 'Proposed Projects',  value: statsData.proposed_projects_count, color: 'text-red-500' },
        { label: 'Completed Projects', value: statsData.completed_projects_count, color: 'text-green-500' },
    ];
    return (
        <DashboardLayout pageTitle="Dashboard">
            <div className="space-y-5">

                {/* Stat Cards Row */}
                <div className="flex gap-4">
                    {stats.map((s) => (
                        <StatCard key={s.label} {...s} />
                    ))}
                </div>

                {/* Project Teams */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0F0F8]">
                    <h2 className="text-base font-bold text-[#706BFF] mb-4">Project Teams</h2>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {teams.map((t, i) => (
                            <ProjectTeamCard key={i} {...t} />
                        ))}
                    </div>
                </div>

                {/* Bottom: Ongoing Projects + Project Updates */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Ongoing Projects (left) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0F0F8]">
                        <h2 className="text-base font-bold text-[#706BFF] mb-4">Ongoing Projects</h2>
                        {ongoingProjects.map((p, i) => (
                            <OngoingProjectRow key={i} {...p} />
                        ))}
                    </div>

                    {/* Project Updates (right) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0F0F8]">
                        <h2 className="text-base font-bold text-[#706BFF] mb-4">Project Updates</h2>
                        {projectUpdates.map((count, i) => (
                            <ProjectUpdateCard key={i} count={count} index={i} />
                        ))}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}



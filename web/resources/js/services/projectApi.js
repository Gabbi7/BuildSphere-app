import api from './api';

// ── Projects ────────────────────────────────────────────────────────────

export const getProjects = (params = {}) =>
    api.get('/projects', { params });

export const createProject = (data) =>
    api.post('/projects', data);

export const getProject = (id) =>
    api.get(`/projects/${id}`);

export const updateProject = (id, data) =>
    api.put(`/projects/${id}`, data);

export const deleteProject = (id) =>
    api.delete(`/projects/${id}`);

export const getMilestonePlan = (projectId) =>
    api.get(`/api/projects/${projectId}/milestone-plan`);

export const storeMilestonePlan = (projectId, phases) =>
    api.post(`/api/projects/${projectId}/milestone-plan`, { phases });

export const getMilestoneChart = (projectId) =>
    api.get(`/api/projects/${projectId}/milestone-chart`);

export const submitMilestoneReview = (projectId) =>
    api.post(`/api/projects/${projectId}/milestone-submit`);

export const getPhaseTitles = () =>
    api.get('/api/phase-titles');

// ── Approvals ───────────────────────────────────────────────────────────

export const submitAccountingApproval = (projectId, data) =>
    api.post(`/projects/${projectId}/accounting-approval`, data);

export const submitExecutiveApproval = (projectId, data) =>
    api.post(`/projects/${projectId}/executive-approval`, data);

// ── Supporting ──────────────────────────────────────────────────────────

export const getProjectStatuses = () =>
    api.get('/project-statuses');

export const getClients = () =>
    api.get('/clients');

export const createClient = (data) =>
    api.post('/clients', data);

export const getUsers = () =>
    api.get('/users');

import api from './api';

const BASE = '/api/tasks';

export const getTasks = (params = {}) =>
    api.get(BASE, { params }).then(r => r.data);

export const getTaskMeta = () =>
    api.get(`${BASE}/meta`).then(r => r.data);

export const getTaskById = (id) =>
    api.get(`${BASE}/${id}`).then(r => r.data);

export const createTask = (payload) => {
    // If payload is FormData (has files), send as multipart
    const isFormData = payload instanceof FormData;
    return api.post(BASE, payload, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }).then(r => r.data);
};

export const updateTask = (id, payload) =>
    api.put(`${BASE}/${id}`, payload).then(r => r.data);

export const updateTaskStatus = (id, status) =>
    api.patch(`${BASE}/${id}/status`, { status }).then(r => r.data);

export const deleteTask = (id) =>
    api.delete(`${BASE}/${id}`).then(r => r.data);

export const getTaskComments = (id) =>
    api.get(`${BASE}/${id}/comments`).then(r => r.data);

export const createTaskComment = (id, comment) =>
    api.post(`${BASE}/${id}/comments`, { comment }).then(r => r.data);

export const getTaskAttachments = (id) =>
    api.get(`${BASE}/${id}/attachments`).then(r => r.data);

export const uploadTaskAttachments = (id, formData) =>
    api.post(`${BASE}/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);

import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
    getTasks, getTaskById, createTask,
    updateTaskStatus, createTaskComment, uploadTaskAttachments,
} from '../services/taskApi';

/**
 * Core task data management hook.
 */
export default function useTasks() {
    const [tasks, setTasks]         = useState([]);
    const [meta, setMeta]           = useState(null);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState(null);

    // Track the latest request to avoid races
    const reqRef = useRef(0);

    const fetchTasks = useCallback(async (params = {}) => {
        const reqId = ++reqRef.current;
        setLoading(true);
        setError(null);
        try {
            const data = await getTasks(params);
            if (reqId === reqRef.current) {
                setTasks(data.data ?? []);
                setMeta(data.meta ?? null);
            }
        } catch (err) {
            if (reqId === reqRef.current) {
                setError('Failed to load tasks.');
                toast.error('Failed to load tasks.');
            }
        } finally {
            if (reqId === reqRef.current) setLoading(false);
        }
    }, []);

    const fetchTaskById = useCallback(async (id) => {
        try {
            return await getTaskById(id);
        } catch {
            toast.error('Failed to load task details.');
            return null;
        }
    }, []);

    const addTask = useCallback(async (payload) => {
        const data = await createTask(payload);
        toast.success('Task created successfully!');
        return data;
    }, []);

    const changeStatus = useCallback(async (id, status, optimisticUpdate) => {
        // Optimistically update the local list
        const rollback = tasks.map(t => t.id === id ? { ...t, status } : t);
        optimisticUpdate?.(id, status);
        try {
            await updateTaskStatus(id, status);
        } catch {
            // Roll back on failure
            setTasks(rollback);
            toast.error('Failed to update status.');
        }
    }, [tasks]);

    const addComment = useCallback(async (taskId, comment) => {
        const data = await createTaskComment(taskId, comment);
        return data;
    }, []);

    const addAttachments = useCallback(async (taskId, formData) => {
        const data = await uploadTaskAttachments(taskId, formData);
        toast.success('Files uploaded.');
        return data;
    }, []);

    return {
        tasks, meta, loading, error,
        fetchTasks, fetchTaskById,
        addTask, changeStatus, addComment, addAttachments,
        setTasks,
    };
}

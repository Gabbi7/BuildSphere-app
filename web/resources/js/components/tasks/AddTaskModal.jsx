import React, { useState, useEffect } from 'react';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../utils/taskConstants';
import { buildTaskFormData } from '../../utils/taskHelpers';
import api from '../../services/api';

const STEPS = ['Details', 'Description'];

export default function AddTaskModal({ onClose, onSuccess, user }) {
    const [step, setStep]           = useState(0);
    const [submitting, setSubmitting]= useState(false);
    const [success, setSuccess]     = useState(false);
    const [errors, setErrors]       = useState({});

    // Meta
    const [projects, setProjects]   = useState([]);
    const [phases, setPhases]       = useState([]);
    const [milestones, setMilestones]= useState([]);
    const [users, setUsers]         = useState([]);
    const [files, setFiles]         = useState([]);

    const [form, setForm] = useState({
        title: '', project_id: '', phase_id: '', milestone_id: '',
        description: '', assigned_to: '',
        priority: 'medium', status: 'todo',
        start_date: '', due_date: '',
    });

    // Load meta on mount
    useEffect(() => {
        api.get('/api/tasks/meta').then(r => {
            setProjects(r.data.projects ?? []);
            setUsers(r.data.users ?? []);
        });
    }, []);

    // Reload phases when project changes
    useEffect(() => {
        if (!form.project_id) { setPhases([]); setMilestones([]); return; }
        // Use the existing milestone-plan endpoint — it returns phases with milestones
        api.get(`/api/projects/${form.project_id}/milestone-plan`)
            .then(r => setPhases(r.data.phases ?? []))
            .catch(() => setPhases([])); // Project may have no plan yet
        setForm(f => ({ ...f, phase_id: '', milestone_id: '' }));
    }, [form.project_id]);

    // Reload milestones when phase changes
    useEffect(() => {
        if (!form.phase_id) { setMilestones([]); return; }
        const ph = phases.find(p => String(p.id) === String(form.phase_id));
        setMilestones(ph?.milestones ?? []);
        setForm(f => ({ ...f, milestone_id: '' }));
    }, [form.phase_id, phases]);

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

    const validate = () => {
        const e = {};
        if (!form.title.trim())       e.title       = 'Task title is required.';
        if (!form.project_id)         e.project_id  = 'Please select a project.';
        if (!form.description.trim()) e.description = 'Description is required.';
        if (!form.assigned_to)        e.assigned_to = 'Please select an assignee.';
        if (!form.priority)           e.priority    = 'Please select priority.';
        if (!form.due_date)           e.due_date    = 'Due date is required.';
        if (form.start_date && form.due_date && form.due_date < form.start_date)
            e.due_date = 'Due date must be on or after start date.';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSubmitting(true);
        try {
            const payload = buildTaskFormData({
                title:        form.title,
                project_id:   form.project_id,
                phase_id:     form.phase_id    || null,
                milestone_id: form.milestone_id || null,
                description:  form.description,
                assigned_to:  form.assigned_to,
                priority:     form.priority,
                status:       form.status,
                start_date:   form.start_date  || null,
                due_date:     form.due_date,
            }, files);

            await api.post('/api/tasks', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess(true);
        } catch (err) {
            const serverErrors = err.response?.data?.errors ?? {};
            setErrors(serverErrors);
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = (field) =>
        `w-full px-3 py-2.5 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2
         focus:ring-[#5B5BD6]/30 placeholder:text-[#C0C0D8]
         ${errors[field] ? 'border-red-400' : 'border-[#E0E0F0]'}`;

    // Success screen
    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm text-center">
                    <div className="w-16 h-16 rounded-full bg-[#5B5BD6] text-white flex items-center justify-center mx-auto mb-5 text-3xl">✓</div>
                    <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">Task Created!</h3>
                    <p className="text-sm text-[#6B6B8D] mb-6">Task created successfully and added to the project.</p>
                    <button
                        onClick={() => { onSuccess(); onClose(); }}
                        className="w-full py-2.5 bg-[#5B5BD6] text-white font-semibold rounded-xl hover:bg-[#4747B8] transition-colors"
                    >
                        Back to Tasks
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <h2 className="text-lg font-bold text-[#5B5BD6]">Add a new task</h2>
                    <button onClick={onClose} className="text-[#9090A8] hover:text-[#3A3A5C] p-1 rounded-lg hover:bg-[#F0F0F8]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 px-6 pb-4">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-6 h-2 rounded-full transition-colors ${i <= step ? 'bg-[#5B5BD6]' : 'bg-[#E0E0F0]'}`} />
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                    {/* STEP 0: Project details */}
                    {step === 0 && (
                        <>
                            <div>
                                <label className="text-xs font-semibold text-[#3A3A5C] mb-1.5 block">Task Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    placeholder="Enter the title of the task here"
                                    className={inputCls('title')}
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#3A3A5C] mb-1.5 block">Project *</label>
                                <select value={form.project_id} onChange={e => set('project_id', e.target.value)} className={inputCls('project_id')}>
                                    <option value="">Select</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                                </select>
                                {errors.project_id && <p className="text-red-500 text-xs mt-1">{errors.project_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-[#3A3A5C] mb-1.5 block">Phase</label>
                                    <select value={form.phase_id} onChange={e => set('phase_id', e.target.value)} className={inputCls('phase_id')}>
                                        <option value="">Select</option>
                                        {phases.map(p => <option key={p.id} value={p.id}>{p.phase_title ?? p.phase_key}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[#3A3A5C] mb-1.5 block">Milestone</label>
                                    <select value={form.milestone_id} onChange={e => set('milestone_id', e.target.value)} className={inputCls('milestone_id')}>
                                        <option value="">Select</option>
                                        {milestones.map(m => <option key={m.id} value={m.id}>{m.milestone_name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const e = {};
                                        if (!form.title.trim())  e.title      = 'Task title is required.';
                                        if (!form.project_id)    e.project_id = 'Please select a project.';
                                        if (Object.keys(e).length) { setErrors(e); return; }
                                        setStep(1);
                                    }}
                                    className="px-6 py-2.5 bg-[#5B5BD6] text-white text-sm font-semibold rounded-xl hover:bg-[#4747B8] transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}

                    {/* STEP 1: Task details */}
                    {step === 1 && (
                        <>
                            <div>
                                <label className="text-xs font-semibold text-[#3A3A5C] mb-1.5 block">Task Description *</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    rows={3}
                                    placeholder="Enter the title of the task here"
                                    className={`${inputCls('description')} resize-none`}
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-[#3A3A5C] mb-1.5 block">Assigned To *</label>
                                    <select value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} className={inputCls('assigned_to')}>
                                        <option value="">Select</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    {errors.assigned_to && <p className="text-red-500 text-xs mt-1">{errors.assigned_to}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[#3A3A5C] mb-1.5 block">Priority Level *</label>
                                    <select value={form.priority} onChange={e => set('priority', e.target.value)} className={inputCls('priority')}>
                                        {Object.entries(TASK_PRIORITIES).map(([k, v]) => (
                                            <option key={k} value={k}>{v.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-[#3A3A5C] mb-1.5 block">Task Start</label>
                                    <input
                                        type="date" value={form.start_date}
                                        onChange={e => set('start_date', e.target.value)}
                                        className={inputCls('start_date')}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[#3A3A5C] mb-1.5 block">Task Until *</label>
                                    <input
                                        type="date" value={form.due_date}
                                        min={form.start_date || undefined}
                                        onChange={e => set('due_date', e.target.value)}
                                        className={inputCls('due_date')}
                                    />
                                    {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>}
                                </div>
                            </div>

                            {/* Attachment */}
                            <div>
                                <label className="text-xs font-semibold text-[#3A3A5C] mb-1.5 block">Attachments (optional)</label>
                                <input
                                    type="file" multiple
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                    onChange={e => setFiles(Array.from(e.target.files))}
                                    className="text-xs text-[#6B6B8D] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#F0F0FE] file:text-[#5B5BD6] hover:file:bg-[#E0E0FE]"
                                />
                                {files.length > 0 && (
                                    <p className="text-xs text-[#6B6B8D] mt-1">{files.length} file(s) selected</p>
                                )}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(0)}
                                    className="text-sm text-[#6B6B8D] hover:text-[#3A3A5C] flex items-center gap-1"
                                >
                                    ‹ Back
                                </button>

                                <div className="flex items-center gap-2">
                                    {/* dot indicator */}
                                    <span className="w-2 h-2 rounded-full bg-[#5B5BD6]" />
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 bg-[#5B5BD6] text-white text-sm font-semibold rounded-xl hover:bg-[#4747B8] disabled:opacity-50 transition-colors"
                                    >
                                        {submitting ? 'Saving…' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

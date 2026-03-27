import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuth from '../hooks/useAuth';
import { createProject, getUsers } from '../services/projectApi';

export default function NewProjectPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        project_name: '',
        client_name: '',
        address: '',
        description: '',
        contract_price: '',
        contract_unit_price: '',
        start_date: '',
        end_date: '',
        project_in_charge_id: '',
        budget_for_materials: '',
    });

    useEffect(() => {
        getUsers()
            .then((res) => setUsers(res.data))
            .catch(() => {});
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const payload = {
                ...form,
                contract_price: parseFloat(form.contract_price) || 0,
                contract_unit_price: form.contract_unit_price ? parseFloat(form.contract_unit_price) : null,
                budget_for_materials: form.budget_for_materials ? parseFloat(form.budget_for_materials) : null,
                project_in_charge_id: form.project_in_charge_id ? parseInt(form.project_in_charge_id) : null,
            };
            await createProject(payload);
            navigate('/projects/success');
        } catch (err) {
            console.error('Create project failed:', err);
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                const message = err.response?.data?.message || 'Something went wrong. Please try again.';
                setErrors({ project_name: [message] });
            }
        } finally {
            setSaving(false);
        }
    };

    const inputClass = (field) =>
        `w-full rounded-2xl border px-5 py-3 text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-[#C1C1C1] ${
            errors[field]
                ? 'border-red-400 focus:ring-red-200'
                : 'border-[#E8E8FF] focus:ring-[#706BFF]/20 focus:border-[#706BFF]'
        }`;

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
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F8] p-8 md:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-[#706BFF] mb-1">Create a Project</h2>
                        <p className="text-sm text-[#A1A1A1]">Create a project by inputting the project details.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Row 1: Project Name + Client */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Project Name</label>
                                <input type="text" name="project_name" value={form.project_name} onChange={handleChange}
                                       placeholder="Enter project name here" className={inputClass('project_name')} />
                                {errors.project_name && <p className="text-red-500 text-xs ml-1">{errors.project_name[0]}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Client</label>
                                <input type="text" name="client_name" value={form.client_name} onChange={handleChange}
                                       placeholder="Enter client name or company" className={inputClass('client_name')} />
                                {errors.client_name && <p className="text-red-500 text-xs ml-1">{errors.client_name[0]}</p>}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Address</label>
                            <input type="text" name="address" value={form.address} onChange={handleChange}
                                   placeholder="e.g., 123 Quezon Ave, Quezon City" className={inputClass('address')} />
                            {errors.address && <p className="text-red-500 text-xs ml-1">{errors.address[0]}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Project Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange} rows="3"
                                      placeholder="Briefly describe the project scope, goals, and deliverables"
                                      className={inputClass('description')} />
                            {errors.description && <p className="text-red-500 text-xs ml-1">{errors.description[0]}</p>}
                        </div>

                        {/* Row 2: Contract Price + Unit Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Contract Price</label>
                                <input type="number" step="0.01" name="contract_price" value={form.contract_price} onChange={handleChange}
                                       placeholder="0.00" className={inputClass('contract_price')} />
                                {errors.contract_price && <p className="text-red-500 text-xs ml-1">{errors.contract_price[0]}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Contract Unit Price</label>
                                <input type="number" step="0.01" name="contract_unit_price" value={form.contract_unit_price} onChange={handleChange}
                                       placeholder="0.00 per unit" className={inputClass('contract_unit_price')} />
                                {errors.contract_unit_price && <p className="text-red-500 text-xs ml-1">{errors.contract_unit_price[0]}</p>}
                            </div>
                        </div>

                        {/* Row 3: Start Date + End Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Project Start</label>
                                <input type="date" name="start_date" value={form.start_date} onChange={handleChange}
                                       className={inputClass('start_date')} />
                                {errors.start_date && <p className="text-red-500 text-xs ml-1">{errors.start_date[0]}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Project End</label>
                                <input type="date" name="end_date" value={form.end_date} onChange={handleChange}
                                       className={inputClass('end_date')} />
                                {errors.end_date && <p className="text-red-500 text-xs ml-1">{errors.end_date[0]}</p>}
                            </div>
                        </div>

                        {/* Row 4: Project-in-Charge + Budget */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Project-in-Charge</label>
                                <div className="relative">
                                    <select name="project_in_charge_id" value={form.project_in_charge_id} onChange={handleChange}
                                            className={`${inputClass('project_in_charge_id')} appearance-none pr-10 ${
                                                form.project_in_charge_id ? 'text-[#1A1A1A]' : 'text-[#C1C1C1]'
                                            }`}>
                                        <option value="">Enter employee name</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#1A1A1A]">
                                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.project_in_charge_id && <p className="text-red-500 text-xs ml-1">{errors.project_in_charge_id[0]}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Budget for materials</label>
                                <input type="number" step="0.01" name="budget_for_materials" value={form.budget_for_materials} onChange={handleChange}
                                       placeholder="0.00" className={inputClass('budget_for_materials')} />
                                {errors.budget_for_materials && <p className="text-red-500 text-xs ml-1">{errors.budget_for_materials[0]}</p>}
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-[#706BFF] hover:bg-[#5B55E6] disabled:opacity-60 text-white
                                       font-bold py-3.5 rounded-2xl transition-all
                                       shadow-[0_8px_25px_rgba(112,107,255,0.3)] active:scale-[0.98]"
                        >
                            {saving ? 'Saving...' : 'Submit'}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';

export default function ProfilePage() {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors]     = useState({});
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [success, setSuccess]   = useState(false);

    useEffect(() => {
        api.get('/profile/me')
            .then(res => {
                const { first_name, last_name, email, role } = res.data;
                setForm(f => ({ ...f, first_name, last_name, email, role }));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: null });
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setSuccess(false);

        const payload = {
            first_name: form.first_name,
            last_name:  form.last_name,
            email:      form.email,
        };
        if (form.password) {
            payload.password              = form.password;
            payload.password_confirmation = form.password_confirmation;
        }

        try {
            await api.put('/profile/update', payload);
            setSuccess(true);
            setForm(f => ({ ...f, password: '', password_confirmation: '' }));
        } catch (err) {
            console.error('Profile update failed:', err);
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                const message = err.response?.data?.message || 'Something went wrong. Please try again.';
                setErrors({ email: [message] });
            }
        } finally {
            setSaving(false);
        }
    };

    const initials = form.first_name && form.last_name
        ? `${form.first_name[0]}${form.last_name[0]}`.toUpperCase()
        : '?';

    const inputClass = (field) =>
        `w-full rounded-2xl border px-5 py-3 text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-[#C1C1C1] bg-white ${
            errors[field]
                ? 'border-red-400 focus:ring-red-200'
                : 'border-[#E8E8FF] focus:ring-[#706BFF]/20 focus:border-[#706BFF]'
        }`;

    if (loading) {
        return (
            <DashboardLayout pageTitle="Profile">
                <div className="flex items-center justify-center h-48">
                    <p className="text-[#A1A1A1] text-sm">Loading profile…</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout pageTitle="Profile">
            <div className="max-w-2xl mx-auto space-y-5">

                {/* Account card */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F8] p-6 flex items-center gap-5">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-[#706BFF] flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {initials}
                    </div>
                    <div>
                        <p className="text-lg font-bold text-[#1A1A1A]">
                            {form.first_name} {form.last_name}
                        </p>
                        <p className="text-sm text-[#A1A1A1] mt-0.5">{form.email}</p>
                        <span className="inline-block mt-2 text-xs font-semibold bg-[#706BFF]/10 text-[#706BFF] px-3 py-1 rounded-full">
                            {form.role}
                        </span>
                    </div>
                </div>

                {/* Form card */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#F0F0F8] p-6">
                    <h2 className="text-base font-bold text-[#1A1A1A] mb-5">Edit Profile</h2>

                    {/* Success banner */}
                    {success && (
                        <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-medium">
                            ✓ Profile updated successfully.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    className={inputClass('first_name')}
                                    placeholder="First name"
                                />
                                {errors.first_name && <p className="text-red-500 text-xs ml-1">{errors.first_name[0]}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    className={inputClass('last_name')}
                                    placeholder="Last name"
                                />
                                {errors.last_name && <p className="text-red-500 text-xs ml-1">{errors.last_name[0]}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className={inputClass('email')}
                                placeholder="Email address"
                            />
                            {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email[0]}</p>}
                        </div>

                        {/* Role — read only */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Company Role</label>
                            <div className="w-full rounded-2xl border border-[#E8E8FF] bg-[#F8F8FF] px-5 py-3 text-sm text-[#A1A1A1]">
                                {form.role}
                            </div>
                            <p className="text-xs text-[#C1C1C1] ml-1">Role cannot be changed.</p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-[#F0F0F8] pt-4">
                            <p className="text-sm font-semibold text-[#1A1A1A] mb-4">Change Password <span className="text-[#A1A1A1] font-normal">(optional)</span></p>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">New Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        className={inputClass('password')}
                                        placeholder="Leave blank to keep current password"
                                    />
                                    {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password[0]}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={form.password_confirmation}
                                        onChange={handleChange}
                                        className={inputClass('password_confirmation')}
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-[#706BFF] hover:bg-[#5B55E6] disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl transition-all shadow-[0_8px_25px_rgba(112,107,255,0.3)] active:scale-[0.98]"
                            >
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </DashboardLayout>
    );
}

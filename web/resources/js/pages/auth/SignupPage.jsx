import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import api from '../../services/api';

export default function SignupPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await api.post('/register', form);
            navigate('/login');
        } catch (err) {
            console.error('Registration failed:', err);
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                const message = err.response?.data?.message || 'Something went wrong. Please try again.';
                setErrors({ email: [message] });
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full rounded-2xl border px-5 py-3 text-base transition-all focus:outline-none focus:ring-2 placeholder:text-[#C1C1C1] ${
            errors[field]
                ? 'border-red-400 focus:ring-red-200'
                : 'border-[#E8E8FF] focus:ring-[#706BFF]/20 focus:border-[#706BFF]'
        }`;

    return (
        <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center px-4 py-4 md:py-6">
            <div className="w-full max-w-[540px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 md:p-10">
                <div className="flex flex-col items-center mb-6">
                    <img src={logo} alt="BuildSphere Logo" className="w-12 h-12 mb-4 object-contain" />
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-1 text-center">
                        Sign up to BuildSphere
                    </h1>
                    <p className="text-[#A1A1A1] text-sm md:text-base">
                        Already have an account? <Link to="/login" className="text-[#706BFF] font-medium hover:underline">Log In</Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                placeholder="Enter your first name"
                                className={inputClass('first_name')}
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
                                placeholder="Enter your last name"
                                className={inputClass('last_name')}
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
                            placeholder="Enter your email"
                            className={inputClass('email').replace('px-5', 'px-6')}
                        />
                        {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email[0]}</p>}
                    </div>

                    {/* Company Role */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Company Role</label>
                        <div className="relative">
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className={`w-full appearance-none rounded-2xl border px-6 py-3 text-base transition-all focus:outline-none focus:ring-2 ${
                                    errors.role
                                        ? 'border-red-400 focus:ring-red-200 text-red-400'
                                        : 'border-[#E8E8FF] focus:ring-[#706BFF]/20 focus:border-[#706BFF] text-[#C1C1C1] focus:text-[#1A1A1A]'
                                } ${form.role ? 'text-[#1A1A1A]' : ''}`}
                            >
                                <option value="" disabled>Select</option>
                                <option value="CEO">CEO</option>
                                <option value="COO">COO</option>
                                <option value="Project Engineer">Project Engineer</option>
                                <option value="Project Coordinator">Project Coordinator</option>
                                <option value="Foreman">Foreman</option>
                                <option value="Sales">Sales</option>
                                <option value="Accounting">Accounting</option>
                                <option value="HR">HR</option>
                                <option value="Procurement">Procurement</option>
                                <option value="Staff">Staff</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-[#1A1A1A]">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                            </div>
                        </div>
                        {errors.role && <p className="text-red-500 text-xs ml-1">{errors.role[0]}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            className={inputClass('password').replace('px-5', 'px-6')}
                        />
                        {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password[0]}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Confirm Password</label>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className={inputClass('password_confirmation').replace('px-5', 'px-6')}
                        />
                        {errors.password_confirmation && <p className="text-red-500 text-xs ml-1">{errors.password_confirmation[0]}</p>}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#706BFF] hover:bg-[#5B55E6] disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl transition-all shadow-[0_8px_25px_rgba(112,107,255,0.3)] active:scale-[0.98]"
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
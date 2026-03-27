import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import api from '../../services/api';

export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
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
            await api.post('/login', form);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login failed:', err);
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

    return (
        <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 md:p-14">
                <div className="flex flex-col items-center mb-10">
                    <img src={logo} alt="BuildSphere Logo" className="w-16 h-16 mb-6 object-contain" />
                    <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2 text-center">
                        Log in to BuildSphere
                    </h1>
                    <p className="text-[#A1A1A1] text-base">
                        Don't have an account? <Link to="/signup" className="text-[#706BFF] font-medium hover:underline">Sign up</Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className={`w-full rounded-2xl border px-6 py-4 text-base transition-all focus:outline-none focus:ring-2 placeholder:text-[#C1C1C1] ${
                                errors.email
                                    ? 'border-red-400 focus:ring-red-200'
                                    : 'border-[#E8E8FF] focus:ring-[#706BFF]/20 focus:border-[#706BFF]'
                            }`}
                        />
                        {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email[0]}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-[#1A1A1A] ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className={`w-full rounded-2xl border px-6 py-4 text-base transition-all focus:outline-none focus:ring-2 placeholder:text-[#C1C1C1] ${
                                errors.password
                                    ? 'border-red-400 focus:ring-red-200'
                                    : 'border-[#E8E8FF] focus:ring-[#706BFF]/20 focus:border-[#706BFF]'
                            }`}
                        />
                        {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password[0]}</p>}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#706BFF] hover:bg-[#5B55E6] disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_8px_25px_rgba(112,107,255,0.3)] active:scale-[0.98]"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>

                    <div className="text-center pt-2">
                        <Link to="#" className="text-[#A1A1A1] text-sm hover:text-[#706BFF] transition-colors">
                            Forgot Password?
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
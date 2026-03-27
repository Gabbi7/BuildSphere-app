import React, { useEffect, useState } from 'react';
import { getPhaseTitles } from '../../services/projectApi';

export default function PhaseTitleSelect({ value, onChange, error, disabled = false }) {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        
        const fetchOptions = async () => {
            try {
                const res = await getPhaseTitles();
                if (isMounted) {
                    setOptions(res.data);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Failed to load phase titles', err);
                if (isMounted) setLoading(false);
            }
        };

        fetchOptions();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="flex flex-col w-full">
            <select
                value={value}
                onChange={onChange}
                disabled={disabled || loading}
                className={`w-full rounded-xl border px-4 py-3 text-sm appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%23A1A1A1%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] pr-10 ${
                    error 
                        ? 'border-red-400 focus:ring-red-200' 
                        : 'border-[#E8E8FF] focus:border-[#706BFF] focus:ring-[#706BFF]/20'
                } focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500`}
            >
                <option value="" disabled>Select Phase Title</option>
                {options.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <span className="text-red-500 text-xs mt-1 ml-1">{error}</span>}
        </div>
    );
}

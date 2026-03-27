import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getMilestonePlan, storeMilestonePlan } from '../services/projectApi';
import MilestonePhaseCard from '../components/projects/MilestonePhaseCard';
import { toast } from 'react-hot-toast';

export default function EngineerMilestoneInputPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [project, setProject] = useState(null);
    const [phases, setPhases] = useState([]);
    const [numPhases, setNumPhases] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchProjectAndMilestones = async () => {
            try {
                const [projRes, planRes] = await Promise.all([
                    getProject(id),
                    getMilestonePlan(id)
                ]);
                
                setProject(projRes.data.data);
                
                const existingPhases = planRes.data.phases || [];
                if (existingPhases.length > 0) {
                    setPhases(existingPhases);
                    setNumPhases(existingPhases.length);
                } else {
                    // Default 1 phase with 1 empty milestone
                    setPhases([{
                        phase_key: '',
                        weight_percentage: '',
                        start_date: '',
                        end_date: '',
                        milestones: [{
                            milestone_name: '',
                            start_date: '',
                            end_date: '',
                            has_quantity: false,
                            quantity_target: ''
                        }]
                    }]);
                    setNumPhases(1);
                }
            } catch (error) {
                console.error('Failed to load project details or milestone plan:', error);
                toast.error('Failed to load project details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjectAndMilestones();
    }, [id]);

    const handleNumPhasesChange = (e) => {
        const newNum = parseInt(e.target.value, 10);
        setNumPhases(newNum);
        
        setPhases(prev => {
            const updated = [...prev];
            if (newNum > updated.length) {
                // Add new empty phases
                for (let i = updated.length; i < newNum; i++) {
                    updated.push({
                        phase_key: '',
                        weight_percentage: '',
                        start_date: '',
                        end_date: '',
                        milestones: [{
                            milestone_name: '',
                            start_date: '',
                            end_date: '',
                            has_quantity: false,
                            quantity_target: ''
                        }]
                    });
                }
            } else if (newNum < updated.length) {
                // Remove trailing phases
                updated.splice(newNum);
            }
            return updated;
        });
    };

    const handlePhaseChange = (phaseIndex, field, value) => {
        setPhases(prev => {
            const updated = [...prev];
            updated[phaseIndex] = { ...updated[phaseIndex], [field]: value };
            return updated;
        });
        
        // Clear specific error
        if (errors[`phases.${phaseIndex}.${field}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`phases.${phaseIndex}.${field}`];
                return newErrors;
            });
        }
    };

    const handleMilestoneChange = (phaseIndex, msIndex, field, value) => {
        setPhases(prev => {
            const updated = [...prev];
            const updatedMilestones = [...updated[phaseIndex].milestones];
            updatedMilestones[msIndex] = { ...updatedMilestones[msIndex], [field]: value };
            
            // Auto-clear target if has_quantity is turned off
            if (field === 'has_quantity' && !value) {
                updatedMilestones[msIndex].quantity_target = '';
            }
            
            updated[phaseIndex] = { ...updated[phaseIndex], milestones: updatedMilestones };
            return updated;
        });
        
        // Clear specific error
        if (errors[`phases.${phaseIndex}.milestones.${msIndex}.${field}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`phases.${phaseIndex}.milestones.${msIndex}.${field}`];
                return newErrors;
            });
        }
    };

    const handleAddMilestone = (phaseIndex) => {
        setPhases(prev => {
            const updated = [...prev];
            updated[phaseIndex].milestones.push({
                milestone_name: '',
                start_date: '',
                end_date: '',
                has_quantity: false,
                quantity_target: ''
            });
            return updated;
        });
    };

    const handleRemoveMilestone = (phaseIndex, msIndex) => {
        setPhases(prev => {
            const updated = [...prev];
            if (updated[phaseIndex].milestones.length > 1) {
                updated[phaseIndex].milestones.splice(msIndex, 1);
            } else {
                toast.error('Each phase must have at least one milestone.');
            }
            return updated;
        });
    };

    const validateForm = () => {
        const newErrors = {};
        
        let totalWeight = 0;
        const phaseKeys = new Set();
        
        phases.forEach((phase, pIdx) => {
            if (!phase.phase_key) newErrors[`phases.${pIdx}.phase_key`] = 'Required';
            else if (phaseKeys.has(phase.phase_key)) newErrors[`phases.${pIdx}.phase_key`] = 'Duplicate';
            else phaseKeys.add(phase.phase_key);
            
            if (!phase.weight_percentage) newErrors[`phases.${pIdx}.weight_percentage`] = 'Required';
            else totalWeight += parseFloat(phase.weight_percentage);
            
            if (!phase.start_date) newErrors[`phases.${pIdx}.start_date`] = 'Required';
            if (!phase.end_date) newErrors[`phases.${pIdx}.end_date`] = 'Required';
            else if (phase.start_date && phase.end_date < phase.start_date) {
                newErrors[`phases.${pIdx}.end_date`] = 'Must be after start';
            }
            
            phase.milestones.forEach((ms, mIdx) => {
                if (!ms.milestone_name) newErrors[`phases.${pIdx}.milestones.${mIdx}.milestone_name`] = 'Required';
                if (!ms.start_date) newErrors[`phases.${pIdx}.milestones.${mIdx}.start_date`] = 'Required';
                if (!ms.end_date) newErrors[`phases.${pIdx}.milestones.${mIdx}.end_date`] = 'Required';
                else if (ms.start_date && ms.end_date < ms.start_date) {
                    newErrors[`phases.${pIdx}.milestones.${mIdx}.end_date`] = 'Must be after start';
                }
                
                // Check if ms dates are within phase dates
                if (phase.start_date && phase.end_date && ms.start_date && ms.end_date) {
                    if (ms.start_date < phase.start_date || ms.end_date > phase.end_date) {
                        newErrors[`phases.${pIdx}.milestones.${mIdx}.general`] = 'Dates must fall within phase range';
                    }
                }
                
                if (ms.has_quantity && !ms.quantity_target) {
                    newErrors[`phases.${pIdx}.milestones.${mIdx}.quantity_target`] = 'Required when toggled';
                }
            });
        });
        
        if (Math.abs(totalWeight - 100) > 0.01) {
            toast.error(`Total phase weight must equal 100%. Current total: ${totalWeight.toFixed(2)}%`);
            newErrors.general = `Total weight: ${totalWeight.toFixed(2)}% (needs 100%)`;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors in the form.');
            return;
        }

        try {
            setSaving(true);
            await storeMilestonePlan(id, phases);
            toast.success('Draft saved. Proceeding to review.');
            navigate(`/projects/${id}/milestone-review`);
        } catch (error) {
            console.error('Save failed:', error);
            if (error.response?.data?.errors) {
                // Map backend errors
                const backendErrors = error.response.data.errors;
                setErrors(backendErrors);
                toast.error('Validation failed on server.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to save milestone plan.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading project data...</div>;
    if (!project) return <div className="p-8 text-center text-red-500">Project not found.</div>;

    const buildNestedErrorObject = (flatErrors) => {
        const nested = { phases: [] };
        // Helper to translate dot notation paths to nested objects for child components
        Object.keys(flatErrors).forEach(key => {
            if (key.startsWith('phases.')) {
                const parts = key.split('.');
                const pIdx = parseInt(parts[1], 10);
                if (!nested.phases[pIdx]) nested.phases[pIdx] = { milestones: [] };
                
                if (parts[2] === 'milestones') {
                    const mIdx = parseInt(parts[3], 10);
                    if (!nested.phases[pIdx].milestones[mIdx]) nested.phases[pIdx].milestones[mIdx] = {};
                    nested.phases[pIdx].milestones[mIdx][parts[4]] = flatErrors[key];
                } else {
                    nested.phases[pIdx][parts[2]] = flatErrors[key];
                }
            } else {
                nested[key] = flatErrors[key];
            }
        });
        return nested;
    };

    const parsedErrors = buildNestedErrorObject(errors);

    return (
        <div className="flex-1 bg-white p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1A1A1A]">Project Milestones</h1>
                    <p className="text-[#5A5A5A] mt-2 max-w-2xl">
                        Define project phases and their nested milestones. Each phase must have a unique title, and the total weight of all phases must equal 100%. Dates of milestones must be within the phase's timeframe.
                    </p>
                </div>

                <div className="bg-[#FAFAFA] rounded-2xl p-6 mb-8 border border-[#E8E8FF]">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-[#1A1A1A]">{project.project_code}</h2>
                            <p className="text-[#5A5A5A]">{project.project_name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-semibold text-[#1A1A1A]">Number of Phases:</label>
                            <select 
                                value={numPhases} 
                                onChange={handleNumPhasesChange}
                                className="rounded-xl border border-[#E8E8FF] px-4 py-2 text-sm focus:border-[#706BFF] focus:outline-none focus:ring-2 focus:ring-[#706BFF]/20"
                            >
                                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {phases.map((phase, index) => (
                        <MilestonePhaseCard
                            key={index}
                            phaseIndex={index}
                            phase={phase}
                            onChange={handlePhaseChange}
                            onAddMilestone={handleAddMilestone}
                            onRemoveMilestone={handleRemoveMilestone}
                            onMilestoneChange={handleMilestoneChange}
                            errors={parsedErrors.phases?.[index] || {}}
                        />
                    ))}
                </div>

                <div className="mt-8 flex justify-end gap-4 border-t pt-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-xl border border-[#E8E8FF] text-[#1A1A1A] font-medium hover:bg-gray-50 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={saving}
                        className="px-8 py-3 rounded-xl bg-[#706BFF] text-white font-medium hover:bg-[#5C57E6] transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                        {saving ? 'Saving...' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
}

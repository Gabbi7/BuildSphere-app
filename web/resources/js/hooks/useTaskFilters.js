import { useState, useCallback } from 'react';
import { SORT_OPTIONS } from '../utils/taskConstants';

/**
 * Manages search, sort, and filter state.
 * Returns state + a query params object ready to pass to getTasks().
 */
export default function useTaskFilters() {
    const [search, setSearch]       = useState('');
    const [sort, setSort]           = useState('newest');
    const [filters, setFilters]     = useState({
        assigned_to: '',
        created_by:  '',
        priority:    '',
        status:      '',
        start_date:  '',
        end_date:    '',
    });

    const setFilter = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setSearch('');
        setSort('newest');
        setFilters({
            assigned_to: '', created_by: '',
            priority: '', status: '', start_date: '', end_date: '',
        });
    }, []);

    // Build query params, stripping empty values
    const toQueryParams = useCallback(() => {
        const params = { sort };
        if (search) params.search = search;
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) params[k] = v;
        });
        return params;
    }, [search, sort, filters]);

    const hasActiveFilters = Object.values(filters).some(v => v !== '') || search !== '';

    return {
        search, setSearch,
        sort, setSort,
        filters, setFilter,
        resetFilters,
        toQueryParams,
        hasActiveFilters,
        sortOptions: SORT_OPTIONS,
    };
}

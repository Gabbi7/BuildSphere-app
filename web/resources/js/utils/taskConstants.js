// Task status values and display config
export const TASK_STATUSES = {
    todo:        { label: 'To Do',       color: 'red',    bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-400'    },
    in_progress: { label: 'In Progress', color: 'amber',  bg: 'bg-amber-100',  text: 'text-amber-600',  dot: 'bg-amber-400'  },
    in_review:   { label: 'In Review',   color: 'violet', bg: 'bg-violet-100', text: 'text-violet-600', dot: 'bg-violet-400' },
    completed:   { label: 'Completed',   color: 'green',  bg: 'bg-green-100',  text: 'text-green-600',  dot: 'bg-green-400'  },
};

// Task priority values and display config
export const TASK_PRIORITIES = {
    low:    { label: 'Low',    bg: 'bg-slate-100',  text: 'text-slate-600'  },
    medium: { label: 'Medium', bg: 'bg-blue-100',   text: 'text-blue-600'   },
    high:   { label: 'High',   bg: 'bg-orange-100', text: 'text-orange-600' },
    urgent: { label: 'Urgent', bg: 'bg-red-100',    text: 'text-red-600'    },
};

export const KANBAN_COLUMNS = ['todo', 'in_progress', 'in_review', 'completed'];

export const SORT_OPTIONS = [
    { value: 'newest',        label: 'Newest First'       },
    { value: 'oldest',        label: 'Oldest First'       },
    { value: 'due_date_asc',  label: 'Due Date (Earliest)'},
    { value: 'due_date_desc', label: 'Due Date (Latest)'  },
    { value: 'priority_asc',  label: 'Priority (Low → High)'},
    { value: 'priority_desc', label: 'Priority (High → Low)'},
    { value: 'status',        label: 'By Status'          },
];

// Roles that can create/manage tasks
export const CREATOR_ROLES = [
    'ceo', 'coo', 'project_engineer', 'project_coordinator',
    'sales', 'accounting', 'human_resource', 'procurement',
];

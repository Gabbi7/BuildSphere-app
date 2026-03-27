<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class TaskQueryService
{
    /**
     * Build a base query with all eager loads for list/kanban view, enforcing visibility.
     */
    public function baseQuery(User $user): Builder
    {
        return Task::with([
            'project:id,project_name',
            'phase:id,phase_key',
            'milestone:id,milestone_name',
            'assignedBy:id,first_name,last_name',
            'assignedTo:id,first_name,last_name',
            'creator:id,first_name,last_name',
        ])
        ->visibleTo($user)
        ->withCount(['comments', 'attachments']);
    }

    /**
     * Apply all supported filters to a query builder.
     */
    public function applyFilters(Builder $query, array $params): Builder
    {
        // Search across title, description, and project name
        if (! empty($params['search'])) {
            $term = $params['search'];
            $query->where(function (Builder $q) use ($term) {
                $q->where('tasks.title', 'ilike', "%{$term}%")
                  ->orWhere('tasks.description', 'ilike', "%{$term}%")
                  ->orWhereHas('project', fn (Builder $pq) =>
                      $pq->where('project_name', 'ilike', "%{$term}%")
                  );
            });
        }

        // Exact filters
        if (! empty($params['project_id'])) {
            $query->where('project_id', $params['project_id']);
        }

        if (! empty($params['assigned_to'])) {
            $query->where('assigned_to', $params['assigned_to']);
        }

        if (! empty($params['created_by'])) {
            $query->where('created_by', $params['created_by']);
        }

        if (! empty($params['priority'])) {
            $query->where('priority', $params['priority']);
        }

        if (! empty($params['status'])) {
            $query->where('status', $params['status']);
        }

        // Date range on due_date
        if (! empty($params['start_date'])) {
            $query->whereDate('due_date', '>=', $params['start_date']);
        }

        if (! empty($params['end_date'])) {
            $query->whereDate('due_date', '<=', $params['end_date']);
        }

        return $query;
    }

    /**
     * Apply sort order to a query.
     */
    public function applySort(Builder $query, ?string $sort): Builder
    {
        return match ($sort) {
            'oldest'          => $query->orderBy('created_at'),
            'due_date_asc'    => $query->orderBy('due_date'),
            'due_date_desc'   => $query->orderByDesc('due_date'),
            'priority_asc'    => $query->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END"),
            'priority_desc'   => $query->orderByRaw("CASE priority WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 WHEN 'urgent' THEN 4 END"),
            'status'          => $query->orderByRaw("CASE status WHEN 'todo' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'in_review' THEN 3 WHEN 'completed' THEN 4 END"),
            default           => $query->orderByDesc('created_at'), // newest
        };
    }
}

<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Roles that can create, update, manage tasks.
     */
    private const CREATOR_ROLES = [
        'ceo', 'coo', 'project_engineer', 'project_coordinator',
        'sales', 'accounting', 'human_resource', 'procurement',
    ];

    private function isCreatorRole(User $user): bool
    {
        $role = str_replace(' ', '_', strtolower($user->role));
        return in_array($role, self::CREATOR_ROLES, true);
    }

    /**
     * All authenticated users can list tasks.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Users can view tasks according to the visibility rules.
     */
    public function view(User $user, Task $task): bool
    {
        return $task->isVisibleTo($user);
    }

    /**
     * Only allowed creator roles can create tasks.
     */
    public function create(User $user): bool
    {
        return $this->isCreatorRole($user);
    }

    /**
     * Only allowed creator roles can update task details, and they must be able to view it.
     */
    public function update(User $user, Task $task): bool
    {
        return $this->isCreatorRole($user) && $this->view($user, $task);
    }

    /**
     * Only allowed creator roles can update task status, and they must be able to view it.
     */
    public function updateStatus(User $user, Task $task): bool
    {
        return $this->isCreatorRole($user) && $this->view($user, $task);
    }

    /**
     * All authenticated users who can view the task can add comments.
     */
    public function addComment(User $user, Task $task): bool
    {
        return $this->view($user, $task);
    }

    /**
     * Only allowed creator roles can upload attachments, and they must be able to view it.
     */
    public function uploadAttachment(User $user, Task $task): bool
    {
        return $this->isCreatorRole($user) && $this->view($user, $task);
    }

    /**
     * Only allowed creator roles can delete tasks, and they must be able to view it.
     */
    public function delete(User $user, Task $task): bool
    {
        return $this->isCreatorRole($user) && $this->view($user, $task);
    }
}

<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectMilestone;
use App\Models\ProjectPhase;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        // Grab first project and users — skip if no projects exist
        $project = Project::first();
        if (! $project) {
            $this->command->warn('TaskSeeder: no projects found. Skipping.');
            return;
        }

        // Get or create a variety of users for realistic assignments
        $users = User::all();
        if ($users->isEmpty()) {
            $this->command->warn('TaskSeeder: no users found. Skipping.');
            return;
        }

        $phase     = ProjectPhase::where('project_id', $project->id)->first();
        $milestone = $phase
            ? ProjectMilestone::where('project_phase_id', $phase->id)->first()
            : null;

        $creator = $users->first();

        // Strip out the custom visibility fields from edge-case plan since we reverted to strict assigned_to logic
        $tasks = [
            [
                'title'       => 'High-Level Project Review (Global Executive)',
                'description' => 'Review overall project margins.',
                'priority'    => 'urgent',
                'status'      => 'todo',
                'start_date'  => now()->toDateString(),
                'due_date'    => now()->addDays(2)->toDateString(),
                'assigned_to' => $users->where('role', 'CEO')->first()?->id ?? $creator->id,
            ],
            [
                'title'       => 'Private Staff Review (Assigned Only)',
                'description' => 'A private task visible only to the assignee and creator.',
                'priority'    => 'medium',
                'status'      => 'todo',
                'start_date'  => now()->toDateString(),
                'due_date'    => now()->addDays(3)->toDateString(),
                'assigned_to' => $users->where('role', 'Staff')->first()?->id ?? $creator->id,
            ],
            [
                'title'       => 'Prepare Billing Statement (Role Based - Accounting)',
                'description' => 'Generate billing for phase 1.',
                'priority'    => 'high',
                'status'      => 'todo',
                'start_date'  => now()->toDateString(),
                'due_date'    => now()->addDays(2)->toDateString(),
                'assigned_to' => $users->where('role', 'Accounting')->first()?->id ?? $creator->id,
            ],
            [
                'title'       => 'Order Steel Rebar (Role Based - Procurement)',
                'description' => 'Order materials.',
                'priority'    => 'high',
                'status'      => 'in_progress',
                'start_date'  => now()->subDays(1)->toDateString(),
                'due_date'    => now()->addDays(4)->toDateString(),
                'assigned_to' => $users->where('role', 'Procurement')->first()?->id ?? $creator->id,
            ],
            [
                'title'       => 'Site Inspection — Level 3 (Project Based)',
                'description' => 'General project inspection.',
                'priority'    => 'medium',
                'status'      => 'todo',
                'start_date'  => now()->toDateString(),
                'due_date'    => now()->addDays(5)->toDateString(),
                'assigned_to' => $users->random()->id,
            ],
            [
                'title'       => 'Creator Visibility Test Task',
                'description' => 'Task not assigned to creator. Creator should still see it.',
                'priority'    => 'low',
                'status'      => 'todo',
                'start_date'  => now()->toDateString(),
                'due_date'    => now()->addDays(1)->toDateString(),
                'assigned_to' => $users->where('id', '!=', $creator->id)->first()?->id ?? $creator->id,
            ],
            [
                'title'       => 'Foundation Pour Check (Foreman Assigned)',
                'description' => 'Checking rebar before pour. Assigned to foreman.',
                'priority'    => 'urgent',
                'status'      => 'in_progress',
                'start_date'  => now()->subDays(2)->toDateString(),
                'due_date'    => now()->addDays(1)->toDateString(),
                'assigned_to' => $users->where('role', 'Foreman')->first()?->id ?? $creator->id,
            ],
            [
                'title'       => 'Internal File Organization (Staff Assigned)',
                'description' => 'Organize server files. Assigned to staff.',
                'priority'    => 'low',
                'status'      => 'todo',
                'start_date'  => now()->toDateString(),
                'due_date'    => now()->addDays(10)->toDateString(),
                'assigned_to' => $users->where('role', 'Staff')->first()?->id ?? $creator->id,
            ],
            [
                'title'       => 'MEP Coordination Meeting',
                'description' => 'Schedule and facilitate MEP coordination.',
                'priority'    => 'medium',
                'status'      => 'completed',
                'start_date'  => now()->subDays(10)->toDateString(),
                'due_date'    => now()->subDays(3)->toDateString(),
                'assigned_to' => $users->random()->id,
            ],
            [
                'title'       => 'Safety Toolbox Talk (Role Based - HR)',
                'description' => 'Weekly safety talk logs.',
                'priority'    => 'medium',
                'status'      => 'completed',
                'start_date'  => now()->subDays(7)->toDateString(),
                'due_date'    => now()->subDays(5)->toDateString(),
                'assigned_to' => $users->where('role', 'Human Resource')->first()?->id ?? $creator->id,
            ],
        ];

        foreach ($tasks as $taskData) {
            $task = Task::firstOrCreate(
                [
                    'project_id' => $project->id,
                    'title'      => $taskData['title'],
                ],
                [
                    'phase_id'         => $phase?->id,
                    'milestone_id'     => $milestone?->id,
                    'description'      => $taskData['description'],
                    'assigned_by'      => $creator->id,
                    'assigned_to'      => $taskData['assigned_to'],
                    'priority'         => $taskData['priority'],
                    'status'           => $taskData['status'],
                    'start_date'       => $taskData['start_date'],
                    'due_date'         => $taskData['due_date'],
                    'created_by'       => $creator->id,
                ]
            );

            // Add 2 sample comments per task
            TaskComment::create([
                'task_id' => $task->id,
                'user_id' => $users->random()->id,
                'comment' => 'Initial review completed. Proceeding with field verification.',
            ]);
            TaskComment::create([
                'task_id' => $task->id,
                'user_id' => $creator->id,
                'comment' => 'Please upload supporting documentation once the inspection is done.',
            ]);

            // Add 1 sample attachment record (no physical file in seeds)
            TaskAttachment::create([
                'task_id'     => $task->id,
                'file_name'   => 'site_inspection_report.pdf',
                'file_path'   => 'task-attachments/sample_placeholder.pdf',
                'file_type'   => 'application/pdf',
                'file_size'   => 204800,
                'uploaded_by' => $creator->id,
            ]);
        }

        $this->command->info('TaskSeeder: 10 tasks seeded with comments and attachments.');
    }
}

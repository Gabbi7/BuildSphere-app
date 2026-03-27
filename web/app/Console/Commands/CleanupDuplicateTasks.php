<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\TaskAttachment;
use App\Models\TaskComment;
use Illuminate\Console\Command;

class CleanupDuplicateTasks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:cleanup-duplicates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Safely remove duplicate tasks, keeping the oldest record and re-linking relationships.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting duplicate task cleanup...');

        $allTasks = Task::orderBy('created_at', 'asc')->get();
        $seen = [];
        $deletedCount = 0;

        foreach ($allTasks as $task) {
            $key = implode('|', [
                $task->title,
                $task->project_id,
                $task->assigned_to,
                $task->assigned_by,
                $task->due_date ?? 'null',
            ]);

            if (isset($seen[$key])) {
                $keptTaskId = $seen[$key];

                // Reassign comments to the kept task
                TaskComment::where('task_id', $task->id)->update(['task_id' => $keptTaskId]);
                
                // Reassign attachments to the kept task
                TaskAttachment::where('task_id', $task->id)->update(['task_id' => $keptTaskId]);

                // Delete the duplicate
                $task->forceDelete();
                
                $deletedCount++;
                $this->line("Deleted duplicate task ID: {$task->id} (kept ID: {$keptTaskId})");
            } else {
                $seen[$key] = $task->id;
            }
        }

        $this->info("Cleanup complete. Removed {$deletedCount} duplicate tasks.");
    }
}

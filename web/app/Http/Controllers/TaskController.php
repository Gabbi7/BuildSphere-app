<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\UpdateTaskStatusRequest;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Services\TaskQueryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(private readonly TaskQueryService $queryService)
    {
    }

    /**
     * GET /api/tasks
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Task::class);

        $query = $this->queryService->baseQuery($request->user());
        $query = $this->queryService->applyFilters($query, $request->all());
        $query = $this->queryService->applySort($query, $request->input('sort'));

        $perPage = (int) $request->input('per_page', 20);
        $perPage = max(1, min($perPage, 100));

        $tasks = $query->paginate($perPage);

        return response()->json([
            'data' => $tasks->map(fn (Task $task) => $this->formatTask($task)),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page'    => $tasks->lastPage(),
                'per_page'     => $tasks->perPage(),
                'total'        => $tasks->total(),
            ],
        ]);
    }

    /**
     * GET /api/tasks/meta — Filter dropdown data.
     */
    public function meta(): JsonResponse
    {
        $this->authorize('viewAny', Task::class);

        $projects = Project::orderBy('project_name')
            ->select('id', 'project_name')
            ->get();

        $users = User::orderBy('first_name')
            ->select('id', 'first_name', 'last_name', 'role')
            ->get()
            ->map(fn ($u) => [
                'id'   => $u->id,
                'name' => $u->first_name . ' ' . $u->last_name,
                'role' => $u->role,
            ]);

        return response()->json([
            'projects'   => $projects,
            'users'      => $users,
            'priorities' => ['low', 'medium', 'high', 'urgent'],
            'statuses'   => ['todo', 'in_progress', 'in_review', 'completed'],
        ]);
    }

    /**
     * GET /api/tasks/{task}
     */
    public function show(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $task->load([
            'project:id,project_name',
            'phase:id,phase_key',
            'milestone:id,milestone_name',
            'assignedBy:id,first_name,last_name',
            'assignedTo:id,first_name,last_name',
            'creator:id,first_name,last_name',
            'updater:id,first_name,last_name',
            'comments.user:id,first_name,last_name',
            'attachments.uploader:id,first_name,last_name',
        ]);

        return response()->json($this->formatTaskDetail($task));
    }

    /**
     * POST /api/tasks
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = Task::create([
            ...$request->safe()->except(['attachments']),
            'assigned_by' => $request->user()->id,
            'created_by'  => $request->user()->id,
            'status'      => $request->input('status', 'todo'),
        ]);

        // Handle optional attachment files uploaded with the create form
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('task-attachments', 'local');
                $task->attachments()->create([
                    'file_name'   => $file->getClientOriginalName(),
                    'file_path'   => $path,
                    'file_type'   => $file->getMimeType(),
                    'file_size'   => $file->getSize(),
                    'uploaded_by' => $request->user()->id,
                ]);
            }
        }

        $task->load([
            'project:id,project_name',
            'phase:id,phase_key',
            'milestone:id,milestone_name',
            'assignedBy:id,first_name,last_name',
            'assignedTo:id,first_name,last_name',
            'creator:id,first_name,last_name',
        ]);
        $task->loadCount(['comments', 'attachments']);

        return response()->json($this->formatTask($task), 201);
    }

    /**
     * PUT /api/tasks/{task}
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $task->update([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ]);

        $task->load([
            'project:id,project_name',
            'phase:id,phase_key',
            'milestone:id,milestone_name',
            'assignedBy:id,first_name,last_name',
            'assignedTo:id,first_name,last_name',
            'creator:id,first_name,last_name',
        ]);
        $task->loadCount(['comments', 'attachments']);

        return response()->json($this->formatTask($task));
    }

    /**
     * PATCH /api/tasks/{task}/status
     */
    public function updateStatus(UpdateTaskStatusRequest $request, Task $task): JsonResponse
    {
        $task->update([
            'status'     => $request->validated('status'),
            'updated_by' => $request->user()->id,
        ]);

        return response()->json(['status' => $task->status]);
    }

    /**
     * DELETE /api/tasks/{task}
     */
    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        // Delete associated files from storage before soft-deleting
        foreach ($task->attachments as $attachment) {
            \Illuminate\Support\Facades\Storage::disk('local')->delete($attachment->file_path);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted.']);
    }

    // ─────────────────────────────────────────────────────────────────────────

    private function formatTask(Task $task): array
    {
        return [
            'id'               => $task->id,
            'title'            => $task->title,
            'description'      => $task->description,
            'priority'         => $task->priority,
            'status'           => $task->status,
            'start_date'       => $task->start_date?->toDateString(),
            'due_date'         => $task->due_date?->toDateString(),
            'project'          => $task->project ? ['id' => $task->project->id, 'name' => $task->project->project_name] : null,
            'phase'            => $task->phase   ? ['id' => $task->phase->id,   'name' => $task->phase->phase_key]     : null,
            'milestone'        => $task->milestone ? ['id' => $task->milestone->id, 'name' => $task->milestone->milestone_name] : null,
            'assigned_by'      => $task->assignedBy ? ['id' => $task->assignedBy->id, 'name' => $task->assignedBy->first_name . ' ' . $task->assignedBy->last_name] : null,
            'assigned_to'      => $task->assignedTo ? ['id' => $task->assignedTo->id, 'name' => $task->assignedTo->first_name . ' ' . $task->assignedTo->last_name] : null,
            'created_by'       => $task->creator   ? ['id' => $task->creator->id,   'name' => $task->creator->first_name   . ' ' . $task->creator->last_name]   : null,
            'comments_count'   => $task->comments_count ?? 0,
            'attachments_count'=> $task->attachments_count ?? 0,
            'created_at'       => $task->created_at?->toIso8601String(),
            'updated_at'       => $task->updated_at?->toIso8601String(),
        ];
    }

    private function formatTaskDetail(Task $task): array
    {
        $base = $this->formatTask($task);

        $base['updater'] = $task->updater
            ? ['id' => $task->updater->id, 'name' => $task->updater->first_name . ' ' . $task->updater->last_name]
            : null;

        $base['comments'] = $task->comments->map(fn ($c) => [
            'id'         => $c->id,
            'comment'    => $c->comment,
            'created_at' => $c->created_at?->toIso8601String(),
            'user'       => ['id' => $c->user->id, 'name' => $c->user->first_name . ' ' . $c->user->last_name],
        ]);

        $base['attachments'] = $task->attachments->map(fn ($a) => [
            'id'          => $a->id,
            'file_name'   => $a->file_name,
            'file_type'   => $a->file_type,
            'file_size'   => $a->file_size,
            'created_at'  => $a->created_at?->toIso8601String(),
            'uploader'    => ['id' => $a->uploader->id, 'name' => $a->uploader->first_name . ' ' . $a->uploader->last_name],
            'download_url'=> route('task.attachment.download', ['task' => $task->id, 'attachment' => $a->id]),
        ]);

        return $base;
    }
}

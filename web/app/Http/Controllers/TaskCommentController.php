<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskCommentRequest;
use App\Models\Task;
use Illuminate\Http\JsonResponse;

class TaskCommentController extends Controller
{
    /**
     * GET /api/tasks/{task}/comments
     */
    public function index(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $comments = $task->comments()
            ->with('user:id,first_name,last_name')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($c) => [
                'id'         => $c->id,
                'comment'    => $c->comment,
                'created_at' => $c->created_at?->toIso8601String(),
                'user'       => [
                    'id'   => $c->user->id,
                    'name' => $c->user->first_name . ' ' . $c->user->last_name,
                ],
            ]);

        return response()->json(['data' => $comments]);
    }

    /**
     * POST /api/tasks/{task}/comments
     */
    public function store(StoreTaskCommentRequest $request, Task $task): JsonResponse
    {
        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'comment' => $request->validated('comment'),
        ]);

        $comment->load('user:id,first_name,last_name');

        return response()->json([
            'id'         => $comment->id,
            'comment'    => $comment->comment,
            'created_at' => $comment->created_at?->toIso8601String(),
            'user'       => [
                'id'   => $comment->user->id,
                'name' => $comment->user->first_name . ' ' . $comment->user->last_name,
            ],
        ], 201);
    }
}

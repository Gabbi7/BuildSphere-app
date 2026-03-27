<?php

use App\Http\Controllers\ProjectMilestoneController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskAttachmentController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| These routes are loaded by bootstrap/app.php with the /api prefix.
| They use web + auth middleware for session-based SPA authentication.
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth'])->group(function () {
    // Dashboard stats
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Phase title enum options for dropdown
    Route::get('/phase-titles', [ProjectMilestoneController::class, 'phaseTitles']);

    // Milestone plan CRUD
    Route::get('/projects/{project}/milestone-plan',  [ProjectMilestoneController::class, 'getMilestonePlan']);
    Route::post('/projects/{project}/milestone-plan', [ProjectMilestoneController::class, 'storeMilestonePlan']);

    // Chart (read-only, derived)
    Route::get('/projects/{project}/milestone-chart', [ProjectMilestoneController::class, 'getMilestoneChart']);

    // Final submit
    Route::post('/projects/{project}/milestone-submit', [ProjectMilestoneController::class, 'submitMilestoneReview']);

    // ── Task Module ──────────────────────────────────────────────────────

    // Meta (must be before {task} to avoid route collision)
    Route::get('/tasks/meta', [TaskController::class, 'meta']);

    // Task CRUD
    Route::get('/tasks',             [TaskController::class, 'index']);
    Route::post('/tasks',            [TaskController::class, 'store']);
    Route::get('/tasks/{task}',      [TaskController::class, 'show']);
    Route::put('/tasks/{task}',      [TaskController::class, 'update']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::delete('/tasks/{task}',   [TaskController::class, 'destroy']);

    // Comments
    Route::get('/tasks/{task}/comments',  [TaskCommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store']);

    // Attachments
    Route::get('/tasks/{task}/attachments',  [TaskAttachmentController::class, 'index']);
    Route::post('/tasks/{task}/attachments', [TaskAttachmentController::class, 'store']);
    Route::get(
        '/tasks/{task}/attachments/{attachment}/download',
        [TaskAttachmentController::class, 'download']
    )->name('task.attachment.download');
});

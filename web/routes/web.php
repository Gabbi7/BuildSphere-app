<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectMilestoneController;
use App\Http\Controllers\ProjectApprovalController;
use App\Http\Controllers\ClientController;

// Public auth routes
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// Protected routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/auth/user', fn() => response()->json(auth()->user()));

    Route::get('/profile/me', [ProfileController::class, 'show']);
    Route::put('/profile/update', [ProfileController::class, 'update']);

    // ── Projects Module ─────────────────────────────────────────────
    Route::get('/project-statuses', [ProjectController::class, 'statuses']);

    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    // Milestones
    Route::get('/projects/{project}/milestones', [ProjectMilestoneController::class, 'index']);
    Route::post('/projects/{project}/milestones', [ProjectMilestoneController::class, 'store']);

    // Approvals
    Route::post('/projects/{project}/accounting-approval', [ProjectApprovalController::class, 'accountingApproval']);
    Route::post('/projects/{project}/executive-approval', [ProjectApprovalController::class, 'executiveApproval']);

    // Clients
    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);

    // Users list (for project-in-charge dropdown)
    Route::get('/users', function () {
        return \App\Models\User::where('role', 'Project Engineer')
            ->select('id', 'first_name', 'last_name', 'role')
            ->orderBy('first_name')
            ->get()
            ->map(fn ($u) => [
                'id'   => $u->id,
                'name' => $u->first_name . ' ' . $u->last_name,
                'role' => $u->role,
            ]);
    });

});

// Catch-all: serve React app (MUST be last)
Route::view('/{any?}', 'welcome')->where('any', '.*');
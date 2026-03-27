<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Http\Requests\CreateProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}

    /**
     * GET /projects — list projects with search, filter, sort, pagination.
     */
    public function index(Request $request)
    {
        $query = Project::with(['creator', 'projectInCharge'])
            ->withCount('milestones');

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        // Filter by creator
        if ($request->filled('created_by')) {
            $query->createdByUser($request->created_by);
        }

        // Sorting
        $sortField = match ($request->input('sort')) {
            'oldest'     => ['created_at', 'asc'],
            'start_date' => ['start_date', 'asc'],
            'end_date'   => ['end_date', 'asc'],
            default      => ['created_at', 'desc'], // newest
        };
        $query->orderBy($sortField[0], $sortField[1]);

        $projects = $query->paginate($request->input('per_page', 12));

        return ProjectResource::collection($projects);
    }

    /**
     * POST /projects — create a new project.
     */
    public function store(CreateProjectRequest $request)
    {
        $project = $this->projectService->createProject(
            $request->validated(),
            $request->user()
        );

        $project->load(['creator', 'projectInCharge']);

        return new ProjectResource($project);
    }

    /**
     * GET /projects/{project} — show a single project.
     */
    public function show(Project $project)
    {
        $project->load([
            'creator',
            'projectInCharge',
            'milestones.creator',
            'approvals.approver',
            'activityLogs.user',
        ]);
        $project->loadCount('milestones');

        return new ProjectResource($project);
    }

    /**
     * PUT /projects/{project} — update project details.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->update($request->validated());
        $project->load(['creator', 'projectInCharge']);

        return new ProjectResource($project);
    }

    /**
     * DELETE /projects/{project} — soft-delete.
     */
    public function destroy(Request $request, Project $project)
    {
        if ($request->user()->role !== 'Sales' || $project->status !== ProjectStatus::PROPOSED) {
            return response()->json(['message' => 'Not authorized to delete this project.'], 403);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted.']);
    }

    /**
     * GET /project-statuses — return all statuses with labels.
     */
    public function statuses()
    {
        $statuses = collect(ProjectStatus::cases())->map(fn ($s) => [
            'value'       => $s->value,
            'label'       => $s->label(),
            'badge_label' => $s->badgeLabel(),
            'badge_color' => $s->badgeColor(),
        ]);

        return response()->json($statuses);
    }
}

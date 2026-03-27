<?php

namespace App\Http\Controllers;

use App\Enums\ProjectPhaseTitle;
use App\Enums\ProjectStatus;
use App\Http\Requests\StoreProjectMilestonePlanRequest;
use App\Models\Project;
use App\Services\ProjectMilestoneChartService;
use App\Services\ProjectService;
use Illuminate\Http\Request;

class ProjectMilestoneController extends Controller
{
    public function __construct(
        private ProjectService $projectService,
        private ProjectMilestoneChartService $chartService,
    ) {}

    /**
     * GET /api/projects/{project}/milestone-plan
     * Returns phases + milestones for editing.
     */
    public function getMilestonePlan(Project $project)
    {
        $project->load(['phases.milestones']);

        $phases = $project->phases->map(fn ($phase) => [
            'id'                => $phase->id,
            'phase_key'         => $phase->phase_key,
            'phase_title'       => $phase->phase_title,
            'weight_percentage' => (float) $phase->weight_percentage,
            'start_date'        => $phase->start_date->format('Y-m-d'),
            'end_date'          => $phase->end_date->format('Y-m-d'),
            'sequence_no'       => $phase->sequence_no,
            'milestones'        => $phase->milestones->map(fn ($ms) => [
                'id'              => $ms->id,
                'milestone_name'  => $ms->milestone_name,
                'start_date'      => $ms->start_date->format('Y-m-d'),
                'end_date'        => $ms->end_date->format('Y-m-d'),
                'has_quantity'    => (bool) $ms->has_quantity,
                'quantity_target' => $ms->target_quantity ? (float) $ms->target_quantity : null,
                'sequence_no'     => $ms->sequence_no,
            ]),
        ]);

        return response()->json([
            'project_id'   => $project->id,
            'project_name' => $project->project_name,
            'status'       => $project->status->value,
            'is_editable'  => in_array($project->status, [ProjectStatus::PROPOSED, ProjectStatus::FOR_REVISION]),
            'phases'        => $phases,
        ]);
    }

    /**
     * POST /api/projects/{project}/milestone-plan
     * Saves draft — does NOT change project status.
     */
    public function storeMilestonePlan(StoreProjectMilestonePlanRequest $request, Project $project)
    {
        $updated = $this->projectService->saveMilestonePlan(
            $project,
            $request->validated()['phases'],
            $request->user()
        );

        return response()->json([
            'message' => 'Milestone plan saved.',
        ]);
    }

    /**
     * GET /api/projects/{project}/milestone-chart
     * Returns dynamically derived chart payload.
     */
    public function getMilestoneChart(Project $project)
    {
        return response()->json(
            $this->chartService->buildChartPayload($project)
        );
    }

    /**
     * POST /api/projects/{project}/milestone-submit
     * Finalizes plan and transitions status.
     */
    public function submitMilestoneReview(Request $request, Project $project)
    {
        $user = $request->user();

        if ($user->role !== 'Project Engineer') {
            return response()->json(['message' => 'Only Project Engineers can submit milestone plans.'], 403);
        }

        if (!in_array($project->status, [ProjectStatus::PROPOSED, ProjectStatus::FOR_REVISION])) {
            return response()->json([
                'message' => 'Milestone plan can only be submitted for projects in Proposed or For Revision status.',
            ], 422);
        }

        // Ensure phases exist
        if ($project->phases()->count() === 0) {
            return response()->json([
                'message' => 'Please save a milestone plan before submitting.',
            ], 422);
        }

        $this->projectService->submitMilestonePlan($project, $user);

        return response()->json([
            'message' => 'Milestone plan submitted for approval.',
        ]);
    }

    /**
     * GET /api/phase-titles
     * Returns allowed phase title options for frontend dropdown.
     */
    public function phaseTitles()
    {
        return response()->json(ProjectPhaseTitle::options());
    }
}

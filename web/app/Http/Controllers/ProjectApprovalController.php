<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Http\Requests\AccountingApprovalRequest;
use App\Http\Requests\ExecutiveApprovalRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;

class ProjectApprovalController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}

    /**
     * POST /projects/{project}/accounting-approval
     */
    public function accountingApproval(AccountingApprovalRequest $request, Project $project)
    {
        if ($project->status !== ProjectStatus::PENDING_ACCOUNTING_APPROVAL) {
            return response()->json([
                'message' => 'This project is not pending accounting approval.',
            ], 422);
        }

        $updated = $this->projectService->processAccountingApproval(
            $project,
            $request->validated()['decision'],
            $request->validated()['comments'] ?? null,
            $request->user()
        );

        $updated->load(['creator', 'projectInCharge']);

        return new ProjectResource($updated);
    }

    /**
     * POST /projects/{project}/executive-approval
     */
    public function executiveApproval(ExecutiveApprovalRequest $request, Project $project)
    {
        if ($project->status !== ProjectStatus::PENDING_EXECUTIVE_APPROVAL) {
            return response()->json([
                'message' => 'This project is not pending executive approval.',
            ], 422);
        }

        $updated = $this->projectService->processExecutiveApproval(
            $project,
            $request->validated()['decision'],
            $request->validated()['comments'] ?? null,
            $request->user()
        );

        $updated->load(['creator', 'projectInCharge']);

        return new ProjectResource($updated);
    }
}

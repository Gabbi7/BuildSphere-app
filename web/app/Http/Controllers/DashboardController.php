<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Enums\ProjectStatus;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get project counts by status for dashboard statistic cards.
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'ongoing_projects_count'  => Project::where('status', ProjectStatus::ONGOING)->count(),
            'proposed_projects_count' => Project::where('status', ProjectStatus::PROPOSED)->count(),
            'completed_projects_count' => Project::where('status', ProjectStatus::COMPLETED)->count(),
        ]);
    }

}

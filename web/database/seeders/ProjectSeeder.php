<?php

namespace Database\Seeders;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        // Find or create a Sales user for seeding
        $salesUser = User::where('role', 'Sales')->first();
        if (!$salesUser) {
            $salesUser = User::factory()->create([
                'first_name' => 'Sales',
                'last_name'  => 'Head',
                'email'      => 'sales@buildsphere.com',
                'role'       => 'Sales',
            ]);
        }

        // Find or create a Project Engineer user
        $engineer = User::where('role', 'Project Engineer')->first();
        if (!$engineer) {
            $engineer = User::factory()->create([
                'first_name' => 'Engr',
                'last_name'  => 'Santos',
                'email'      => 'engineer@buildsphere.com',
                'role'       => 'Project Engineer',
            ]);
        }

        $projects = [
            [
                'project_name'        => 'Quezon City Office Tower',
                'client_name'         => 'XYZ Corporation',
                'address'             => '123 Quezon Ave, Quezon City',
                'description'         => 'A 10-storey commercial office tower with modern amenities.',
                'contract_price'      => 25000000.00,
                'contract_unit_price' => 15000.00,
                'budget_for_materials'=> 12000000.00,
                'start_date'          => '2026-04-01',
                'end_date'            => '2027-03-31',
                'status'              => ProjectStatus::PROPOSED->value,
                'created_by'          => $salesUser->id,
                'project_in_charge_id'=> $engineer->id,
            ],
            [
                'project_name'        => 'Makati Residential Complex',
                'client_name'         => 'Aluminum Works Inc.',
                'address'             => '456 Ayala Ave, Makati City',
                'description'         => 'A mid-rise residential complex with aluminum facade.',
                'contract_price'      => 18000000.00,
                'contract_unit_price' => 12000.00,
                'budget_for_materials'=> 8500000.00,
                'start_date'          => '2026-05-15',
                'end_date'            => '2027-02-28',
                'status'              => ProjectStatus::FOR_REVISION->value,
                'created_by'          => $salesUser->id,
                'project_in_charge_id'=> $engineer->id,
            ],
            [
                'project_name'        => 'BGC Glass Curtain Wall',
                'client_name'         => 'Glassworks Philippines',
                'address'             => '789 Bonifacio High Street, Taguig City',
                'description'         => 'Curtain wall installation for a commercial building.',
                'contract_price'      => 8500000.00,
                'contract_unit_price' => 8000.00,
                'budget_for_materials'=> 4200000.00,
                'start_date'          => '2026-03-01',
                'end_date'            => '2026-09-30',
                'status'              => ProjectStatus::ONGOING->value,
                'created_by'          => $salesUser->id,
                'project_in_charge_id'=> $engineer->id,
            ],
            [
                'project_name'        => 'Mandaluyong Steel Warehouse',
                'client_name'         => 'Metro Steel Corp',
                'address'             => '321 Shaw Blvd, Mandaluyong City',
                'description'         => 'Pre-engineered steel warehouse construction.',
                'contract_price'      => 12000000.00,
                'contract_unit_price' => 10000.00,
                'budget_for_materials'=> 6000000.00,
                'start_date'          => '2026-06-01',
                'end_date'            => '2026-12-31',
                'status'              => ProjectStatus::PENDING_ACCOUNTING_APPROVAL->value,
                'created_by'          => $salesUser->id,
                'project_in_charge_id'=> $engineer->id,
            ],
        ];

        foreach ($projects as $data) {
            Project::firstOrCreate(
                ['project_name' => $data['project_name']],
                $data
            );
        }
    }
}

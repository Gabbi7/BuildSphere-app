<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default test users with different roles
        User::factory()->create([
            'first_name' => 'Test',
            'last_name'  => 'User',
            'email'      => 'test@example.com',
            'role'       => 'CEO',
        ]);

        // Seed clients and projects
        $this->call([
            ClientSeeder::class,
            ProjectSeeder::class,
            TaskSeeder::class,
        ]);
    }
}

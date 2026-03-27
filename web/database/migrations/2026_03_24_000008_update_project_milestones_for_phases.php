<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_milestones', function (Blueprint $table) {
            // Add phase FK (nullable for migration safety, but required in app logic)
            $table->foreignId('project_phase_id')
                  ->nullable()
                  ->after('project_id')
                  ->constrained('project_phases')
                  ->cascadeOnDelete();

            // Add has_quantity flag
            $table->boolean('has_quantity')->default(false)->after('target_quantity');
        });

        // Drop columns that moved to phase level or are no longer needed
        Schema::table('project_milestones', function (Blueprint $table) {
            $table->dropColumn(['weight_percentage', 'description', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('project_milestones', function (Blueprint $table) {
            $table->decimal('weight_percentage', 5, 2)->default(0);
            $table->text('description')->nullable();
            $table->string('status')->default('PENDING');
        });

        Schema::table('project_milestones', function (Blueprint $table) {
            $table->dropForeign(['project_phase_id']);
            $table->dropColumn(['project_phase_id', 'has_quantity']);
        });
    }
};

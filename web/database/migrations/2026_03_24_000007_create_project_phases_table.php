<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_phases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('phase_key');           // enum value, e.g. PREPARATION_PLANNING
            $table->unsignedInteger('sequence_no')->default(1);
            $table->decimal('weight_percentage', 5, 2);
            $table->date('start_date');
            $table->date('end_date');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Each phase title can only be used once per project
            $table->unique(['project_id', 'phase_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_phases');
    }
};

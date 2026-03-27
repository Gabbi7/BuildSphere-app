<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('phase_id')->nullable();
            $table->unsignedBigInteger('milestone_id')->nullable();

            $table->string('title', 255);
            $table->text('description');

            $table->unsignedBigInteger('assigned_by');
            $table->unsignedBigInteger('assigned_to');

            $table->string('priority', 20); // low, medium, high, urgent
            $table->string('status', 20)->default('todo'); // todo, in_progress, in_review, completed

            $table->date('start_date')->nullable();
            $table->date('due_date');

            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('project_id')
                  ->references('id')->on('projects')
                  ->onDelete('cascade');

            $table->foreign('phase_id')
                  ->references('id')->on('project_phases')
                  ->onDelete('set null');

            $table->foreign('milestone_id')
                  ->references('id')->on('project_milestones')
                  ->onDelete('set null');

            $table->foreign('assigned_by')
                  ->references('id')->on('users')
                  ->onDelete('restrict');

            $table->foreign('assigned_to')
                  ->references('id')->on('users')
                  ->onDelete('restrict');

            $table->foreign('created_by')
                  ->references('id')->on('users')
                  ->onDelete('restrict');

            $table->foreign('updated_by')
                  ->references('id')->on('users')
                  ->onDelete('set null');

            // Indexes
            $table->index('project_id');
            $table->index('assigned_to');
            $table->index('assigned_by');
            $table->index('status');
            $table->index('priority');
            $table->index('due_date');
            $table->index('created_by');
            $table->index(['project_id', 'status'], 'tasks_project_status_idx');
            $table->index(['assigned_to', 'status'], 'tasks_assigned_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
